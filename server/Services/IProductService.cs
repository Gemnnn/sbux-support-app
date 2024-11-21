using server.Models;
using System.Threading.Tasks;

namespace server.Services
{
    public interface IProductService
    {
        Task<object> GetProductShelfLifeAsync(string name, string timeZone);
        Task<IEnumerable<Product>> SearchProductsAsync(string partialName);
    }
}
