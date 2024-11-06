using Microsoft.AspNetCore.Mvc;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("shelf-life")]
        public IActionResult GetProductShelfLife([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Product name is required.");
            }

            var (product, expirationDateUtc) = _productService.GetProductWithExpiration(name);

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            // Prepare each component of the expiration date
            var response = new
            {
                ProductName = product.ProductName,
                ShelfLifeDays = product.ShelfLifeDays,
                ExpirationDate = new
                {
                    Month = expirationDateUtc.ToString("MM"),
                    Date = expirationDateUtc.ToString("dd"),
                    DayOfWeek = expirationDateUtc.ToString("dddd"),
                    Time = expirationDateUtc.ToString("HH:mm")
                }
            };

            return Ok(response);
        }
    }
}
