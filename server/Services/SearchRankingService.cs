using server.Models;
using server.Repositories;

namespace server.Services
{
    public class SearchRankingService : ISearchRankingService
    {
        private const int DefaultTake = 5;
        private const int MaxTake = 20;
        private readonly ISearchLogRepository _searchLogRepository;

        public SearchRankingService(ISearchLogRepository searchLogRepository)
        {
            _searchLogRepository = searchLogRepository;
        }

        public async Task RecordSuccessfulSearchAsync(Product product)
        {
            await _searchLogRepository.AddSearchLogAsync(product, DateTime.UtcNow);
        }

        public async Task<IReadOnlyList<SearchRankingItem>> GetWeeklyRankingAsync(int take)
        {
            var safeTake = take <= 0 ? DefaultTake : Math.Min(take, MaxTake);
            var sinceUtc = DateTime.UtcNow.AddDays(-7);

            return await _searchLogRepository.GetTopSearchesAsync(sinceUtc, safeTake);
        }
    }
}
