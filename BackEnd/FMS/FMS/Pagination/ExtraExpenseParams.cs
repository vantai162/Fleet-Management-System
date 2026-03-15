namespace FMS.Pagination
{
    public class ExtraExpenseParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "ExpenseDate";
        public bool IsDescending { get; set; } = true;

        // filters
        public string? Keyword { get; set; }
        public int? TripId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }
}


