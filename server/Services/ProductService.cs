using System;
using server.Repositories;
using server.Models;

namespace server.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<object> GetProductShelfLifeAsync(string name, string timeZone)
        {
            // Fetch product from database
            var product = await _productRepository.GetProductByNameAsync(name);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product '{name}' not found.");
            }

            // Calculate expiration date in UTC
            var expirationDateUtc = DateTime.UtcNow.AddDays(product.ShelfLifeDays);

            // Convert to specified time zone
            DateTime adjustedExpirationDate;
            try
            {
                // Handle GMT offsets like "GMT-5" or "GMT+1"
                if (timeZone.StartsWith("GMT", StringComparison.OrdinalIgnoreCase))
                {
                    adjustedExpirationDate = ConvertFromGmtOffset(timeZone, expirationDateUtc);
                }
                else
                {
                    // Handle standard Windows time zones
                    var userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
                    adjustedExpirationDate = TimeZoneInfo.ConvertTimeFromUtc(expirationDateUtc, userTimeZone);
                }
            }
            catch (TimeZoneNotFoundException)
            {
                throw new ArgumentException($"Invalid time zone: {timeZone}");
            }

            return new
            {
                ProductName = product.ProductName,
                ShelfLifeDays = product.ShelfLifeDays,
                ExpirationDate = new
                {
                    Month = adjustedExpirationDate.ToString("MM"),
                    Date = adjustedExpirationDate.ToString("dd"),
                    DayOfWeek = adjustedExpirationDate.ToString("dddd"),
                    Time = adjustedExpirationDate.ToString("hh:mm tt")
                }
            };
        }

        // handle GMT and GMT-offset formats.
        private DateTime ConvertFromGmtOffset(string gmtOffset, DateTime utcDateTime)
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
