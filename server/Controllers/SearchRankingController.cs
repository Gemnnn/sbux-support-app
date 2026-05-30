using Microsoft.AspNetCore.Mvc;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchRankingController : ControllerBase
    {
        private readonly ISearchRankingService _searchRankingService;

        public SearchRankingController(ISearchRankingService searchRankingService)
        {
            _searchRankingService = searchRankingService;
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeeklyRanking([FromQuery] int take = 5)
        {
            var ranking = await _searchRankingService.GetWeeklyRankingAsync(take);
            return Ok(ranking);
        }
    }
}
