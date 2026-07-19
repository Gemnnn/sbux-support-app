namespace server.Models
{
    public class ProductShelfLifeOption
    {
        public int ProductShelfLifeOptionId { get; set; }
        public int ProductId { get; set; }
        public string PreparationType { get; set; } = string.Empty;
        public int ShelfLifeDays { get; set; }
        public int SortOrder { get; set; }
    }
}
