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
            var nowUtc = DateTime.UtcNow;
            var currentSinceUtc = nowUtc.AddDays(-7);
            var previousSinceUtc = nowUtc.AddDays(-14);

            var currentRanking = await _searchLogRepository.GetTopSearchesAsync(currentSinceUtc, nowUtc, safeTake);
            if (currentRanking.Count == 0)
            {
                return currentRanking;
            }

            var previousRanking = await _searchLogRepository.GetTopSearchesAsync(previousSinceUtc, currentSinceUtc);
            var previousRanksByProduct = previousRanking
                .GroupBy(item => item.NormalizedProductName)
                .ToDictionary(group => group.Key, group => group.First().Rank);

            foreach (var item in currentRanking)
            {
                if (!previousRanksByProduct.TryGetValue(item.NormalizedProductName, out var previousRank))
                {
                    item.PreviousRank = null;
                    item.RankChange = null;
                    item.Trend = "new";
                    continue;
                }

                item.PreviousRank = previousRank;
                item.RankChange = previousRank - item.Rank;

                if (item.Rank < previousRank)
                {
                    item.Trend = "up";
                }
                else if (item.Rank == previousRank)
                {
                    item.Trend = "same";
                }
                else
                {
                    item.Trend = "down";
                }
            }

            return currentRanking;
        }
    }
}
