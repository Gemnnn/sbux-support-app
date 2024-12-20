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

            if (_cache.TryGetValue("AllProducts", out IEnumerable<Product> allProducts))
            {

                return allProducts.Where(p => p.ProductName.Contains(partialName, StringComparison.OrdinalIgnoreCase));
            }


            return await _context.Products
                                 .Where(p => p.ProductName.Contains(partialName))
                                 .ToListAsync();

        }
    }
}
