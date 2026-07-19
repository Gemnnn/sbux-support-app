using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductShelfLifeOption> ProductShelfLifeOptions { get; set; }
        public DbSet<SearchLog> SearchLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductShelfLifeOption>(entity =>
            {
                entity.Property(option => option.PreparationType)
                    .IsRequired()
                    .HasMaxLength(64);

                entity.HasIndex(option => option.ProductId);
                entity.HasIndex(option => new { option.ProductId, option.PreparationType })
                    .IsUnique();

                entity.HasOne<Product>()
                    .WithMany()
                    .HasForeignKey(option => option.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

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
