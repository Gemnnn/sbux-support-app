using server.Models;

namespace server.Repositories
{
    public interface ISearchLogRepository
    {
        Task AddSearchLogAsync(Product product, DateTime searchedAtUtc);
        Task<IReadOnlyList<SearchRankingItem>> GetTopSearchesAsync(DateTime sinceUtc, int take);
    }
}
