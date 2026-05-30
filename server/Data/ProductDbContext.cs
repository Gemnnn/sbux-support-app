using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<SearchLog> SearchLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SearchLog>(entity =>
            {
                entity.Property(log => log.ProductName)
                    .IsRequired()
                    .HasMaxLength(256);

                entity.Property(log => log.NormalizedProductName)
                    .IsRequired()
                    .HasMaxLength(256);

                entity.HasIndex(log => log.SearchedAtUtc);
                entity.HasIndex(log => log.NormalizedProductName);
            });
        }
    }
}
