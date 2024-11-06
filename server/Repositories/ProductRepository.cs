using Microsoft.AspNetCore.Mvc;

using server.Data;
using server.Models;
using System.Linq;

public class ProductRepository
{
    private readonly ProductDbContext _context;

    public ProductRepository(ProductDbContext context)
    {
        _context = context;
    }

    public Product GetProductByName(string productName)
    {
        // Find the product by name (using Contains to allow partial matches)
        return _context.Products.FirstOrDefault(p => p.ProductName.Contains(productName));
    }
}

