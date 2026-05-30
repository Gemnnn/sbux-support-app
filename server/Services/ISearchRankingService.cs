using server.Models;

namespace server.Services
{
    public interface ISearchRankingService
    {
        Task RecordSuccessfulSearchAsync(Product product);
        Task<IReadOnlyList<SearchRankingItem>> GetWeeklyRankingAsync(int take);
    }
}
