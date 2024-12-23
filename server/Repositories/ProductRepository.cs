using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;


namespace server.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ProductDbContext _context;


        public ProductRepository(ProductDbContext context)
        {
            _context = context;
        }

        public async Task<Product> GetProductByNameAsync(string name)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.ProductName.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string partialName)
        {
            return await _context.Products
                .Where(p => EF.Functions.Like(p.ProductName, $"%{partialName}%"))
                .AsNoTracking() 
                .ToListAsync();
        }
    }
}
