using System;
using Microsoft.Extensions.Logging;
using server.Repositories;
using server.Models;

namespace server.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ISearchRankingService _searchRankingService;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IProductRepository productRepository,
            ISearchRankingService searchRankingService,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository;
            _searchRankingService = searchRankingService;
            _logger = logger;
        }

        public async Task<object> GetProductShelfLifeAsync(string name, string timeZone)
        {
            // Fetch product from database
            var product = await _productRepository.GetProductByNameAsync(name);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product '{name}' not found.");
            }

            var utcNow = DateTime.UtcNow;
            DateTime adjustedExpirationDate;
            try
            {
                adjustedExpirationDate = CalculateExpirationDate(
                    utcNow,
                    product.ShelfLifeDays,
                    timeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                throw new ArgumentException($"Invalid time zone: {timeZone}");
            }

            var shelfLifeOptions = await _productRepository.GetShelfLifeOptionsAsync(product.ProductId);
            var optionResponses = shelfLifeOptions
                .Select(option =>
                {
                    var optionExpirationDate = CalculateExpirationDate(
                        utcNow,
                        option.ShelfLifeDays,
                        timeZone);

                    return new
                    {
                        option.PreparationType,
                        ProductName = product.ProductName,
                        option.ShelfLifeDays,
                        ExpirationDate = FormatExpirationDate(optionExpirationDate)
                    };
                })
                .ToList();

            var response = new
            {
                ProductName = product.ProductName,
                ShelfLifeDays = product.ShelfLifeDays,
                ExpirationDate = FormatExpirationDate(adjustedExpirationDate),
                ShelfLifeOptions = optionResponses
            };

            try
            {
                await _searchRankingService.RecordSuccessfulSearchAsync(product);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to record search log for product {ProductId}", product.ProductId);
            }

            return response;
        }

        private static object FormatExpirationDate(DateTime expirationDate)
        {
            return new
            {
                Month = expirationDate.ToString("MM"),
                Date = expirationDate.ToString("dd"),
                DayOfWeek = expirationDate.ToString("dddd"),
                Time = expirationDate.ToString("hh:mm tt")
            };
        }

        private static DateTime CalculateExpirationDate(
            DateTime utcNow,
            int shelfLifeDays,
            string timeZone)
        {
            if (timeZone.StartsWith("GMT", StringComparison.OrdinalIgnoreCase))
            {
                var localNow = ConvertFromGmtOffset(timeZone, utcNow);
                return shelfLifeDays == 30
                    ? localNow.AddMonths(1)
                    : ConvertFromGmtOffset(timeZone, utcNow.AddDays(shelfLifeDays));
            }

            var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            var currentLocalDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, userTimeZone);

            return shelfLifeDays == 30
                ? currentLocalDateTime.AddMonths(1)
                : TimeZoneInfo.ConvertTimeFromUtc(utcNow.AddDays(shelfLifeDays), userTimeZone);
        }

        // handle GMT and GMT-offset formats.
        private static DateTime ConvertFromGmtOffset(string gmtOffset, DateTime utcDateTime)
        {
            // Extract offset from "GMT±x" format
            if (gmtOffset.Length < 4 || !gmtOffset.StartsWith("GMT", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException($"Invalid GMT format: {gmtOffset}");

            var offsetSign = gmtOffset[3]; // '+' or '-'
            if (offsetSign != '+' && offsetSign != '-')
                throw new ArgumentException($"Invalid GMT format: {gmtOffset}");

            // Parse hours
            var hoursPart = gmtOffset.Substring(4);
            if (!int.TryParse(hoursPart, out int offsetHours))
                throw new ArgumentException($"Invalid GMT format: {gmtOffset}");

            var offset = TimeSpan.FromHours(offsetSign == '+' ? offsetHours : -offsetHours);
            return utcDateTime + offset;
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string partialName)
        {
            return await _productRepository.SearchProductsAsync(partialName); 
        }
    }
}
