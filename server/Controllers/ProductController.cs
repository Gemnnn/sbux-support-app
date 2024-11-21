using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("shelf-life")]
        public async Task<IActionResult> GetProductShelfLifeAsync([FromQuery] string name, [FromQuery] string timeZone)
        {
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(timeZone))
            {
                return BadRequest(new
                {
                    Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                    Title = "Validation errors occurred.",
                    Status = 400,
                    Errors = new
                    {
                        name = string.IsNullOrEmpty(name) ? new[] { "The name field is required." } : null,
                        timeZone = string.IsNullOrEmpty(timeZone) ? new[] { "The timeZone field is required." } : null
                    }
                });
            }

            try
            {
                var response = await _productService.GetProductShelfLifeAsync(name, timeZone);
                return Ok(response);
            }
            catch (TimeZoneNotFoundException)
            {
                return BadRequest(new { Error = $"Invalid time zone: {timeZone}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = $"Unexpected error occurred: {ex.Message}" });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts([FromQuery] string query)
        {
            var products = await _productService.SearchProductsAsync(query);

            if (products == null || !products.Any())
            {
                return NotFound(new { Message = "No results found" });
            }

            return Ok(products);
        }
    }
}
