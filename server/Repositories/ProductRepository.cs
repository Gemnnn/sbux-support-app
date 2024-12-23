using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using server.Data;
using server.Models;


namespace server.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ProductDbContext _context;
        private readonly IMemoryCache _cache;


        public ProductRepository(ProductDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Product> GetProductByNameAsync(string name)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.ProductName.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string partialName)
        {
            //return await _context.Products
            //                     .Where(p => p.ProductName.Contains(partialName))
            //                     .ToListAsync();

            // create the cache key
            string cacheKey = $"Search_{partialName.ToLower()}";

            // cache check
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<Product> cachedResults))
            {
                // optimize SQL LIKE query
                cachedResults = await _context.Products
                    .Where(p => EF.Functions.Like(p.ProductName, $"%{partialName}%"))
                    .AsNoTracking() // No Tracking
                    .ToListAsync();

                // 10 minutes Available
                _cache.Set(cacheKey, cachedResults, TimeSpan.FromMinutes(10));
            }

            return cachedResults;

        }
    }
}
