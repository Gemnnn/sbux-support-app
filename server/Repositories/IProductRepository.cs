using server.Models;

namespace server.Repositories
{
    public interface IProductRepository
    {
        Product GetProductByName(string name);
    }
}
