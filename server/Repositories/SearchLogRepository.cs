using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Repositories
{
    public class SearchLogRepository : ISearchLogRepository
    {
        private readonly ProductDbContext _context;

        public SearchLogRepository(ProductDbContext context)
        {
            _context = context;
        }

        public async Task AddSearchLogAsync(Product product, DateTime searchedAtUtc)
        {
            var canonicalName = product.ProductName.Trim();

            _context.SearchLogs.Add(new SearchLog
            {
                ProductId = product.ProductId,
                ProductName = canonicalName,
                NormalizedProductName = canonicalName.ToUpperInvariant(),
                SearchedAtUtc = searchedAtUtc
            });

            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<SearchRankingItem>> GetTopSearchesAsync(DateTime sinceUtc, int take)
        {
            var groupedResults = await _context.SearchLogs
                .AsNoTracking()
                .Where(log => log.SearchedAtUtc >= sinceUtc)
                .GroupBy(log => new { log.NormalizedProductName, log.ProductName })
                .Select(group => new
                {
                    group.Key.ProductName,
                    Count = group.Count()
                })
                .OrderByDescending(item => item.Count)
                .ThenBy(item => item.ProductName)
                .Take(take)
                .ToListAsync();

            return groupedResults
                .Select((item, index) => new SearchRankingItem
                {
                    Rank = index + 1,
                    ProductName = item.ProductName,
                    Count = item.Count
                })
                .ToList();
        }
    }
}
