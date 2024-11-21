using System.Threading.Tasks;
using server.Models;

namespace server.Repositories
{
    public interface IProductRepository
    {
        Task<Product> GetProductByNameAsync(string name);
        Task<IEnumerable<Product>> SearchProductsAsync(string partialName);

    }
}
