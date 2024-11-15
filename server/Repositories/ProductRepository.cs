using System.Linq;
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

        public Product GetProductByName(string name)
        {
            // Use ToLower() to perform a case-insensitive comparison
            return _context.Products
                .FirstOrDefault(p => p.ProductName.ToLower() == name.ToLower());
        }
    }
}
