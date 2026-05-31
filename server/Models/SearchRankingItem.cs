using System.Text.Json.Serialization;

namespace server.Models
{
    public class SearchRankingItem
    {
        public int Rank { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Count { get; set; }
        public int? PreviousRank { get; set; }
        public int? RankChange { get; set; }
        public string Trend { get; set; } = "new";

        [JsonIgnore]
        public string NormalizedProductName { get; set; } = string.Empty;
    }
}
