namespace server.Data;

using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Collections.Generic;

public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
}
