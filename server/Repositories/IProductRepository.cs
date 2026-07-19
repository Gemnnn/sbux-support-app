using System.Threading.Tasks;
using server.Models;

namespace server.Repositories
{
    public interface IProductRepository
    {
        Task<Product> GetProductByNameAsync(string name);
        Task<IReadOnlyList<ProductShelfLifeOption>> GetShelfLifeOptionsAsync(int productId);
        Task<IEnumerable<Product>> SearchProductsAsync(string partialName);

    }
}
