namespace server.Models
{
    public class SearchLog
    {
        public int SearchLogId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string NormalizedProductName { get; set; } = string.Empty;
        public DateTime SearchedAtUtc { get; set; }
    }
}
