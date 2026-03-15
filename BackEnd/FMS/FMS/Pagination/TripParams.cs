namespace FMS.Pagination
{
    public class TripParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "StartTime";
        public bool IsDescending { get; set; } = true;

        // Các tiêu chí lọc
        public string? TripStatus { get; set; }
        
        // Filter by the UserID of the assigned driver (optional, used for driver view)
        public int? DriverUserId { get; set; }
        
        // Search keyword (vehicle license plate or driver name)
        public string? Keyword { get; set; }
        
        // Date filters
        public int? Day { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
}
