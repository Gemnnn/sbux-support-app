using Microsoft.AspNetCore.Mvc;
using server.Models;

namespace server.Services
{
    public class ProductService
    {
        private readonly ProductRepository _productRepository;

        public ProductService(ProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public (Product product, DateTime expirationDateUtc) GetProductWithExpiration(string productName)
        {
            var product = _productRepository.GetProductByName(productName);

            if (product == null)
            {
                return (null, DateTime.MinValue);
            }

            // Calculate the expiration date based on ShelfLifeDays
            DateTime expirationDateUtc = DateTime.UtcNow.AddDays(product.ShelfLifeDays);

            return (product, expirationDateUtc);
        }
    }
}
