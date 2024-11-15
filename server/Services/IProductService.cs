namespace server.Services
{
    public interface IProductService
    {
        object GetProductShelfLife(string name, string timeZone);
    }
}
