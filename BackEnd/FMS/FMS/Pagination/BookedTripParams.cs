namespace FMS.Pagination
{
    public class BookedTripParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "StartTime";
        public bool IsDescending { get; set; } = true;
        
        // Search keyword (customer name, phone, email)
        public string? Keyword { get; set; }
        
        // Date filters
        public int? Day { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
}
