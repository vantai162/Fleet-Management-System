namespace FMS.Pagination
{
    public class DriverParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "DriverStatus";
        public bool IsDescending { get; set; } = true;

        // Các tiêu chí lọc
        public string? DriverStatus { get; set; }
        
        // Search keyword (name, phone, email)
        public string? Keyword { get; set; }
        
        // Rating filter
        public double? MinRating { get; set; }
        public double? MaxRating { get; set; }
        
        // Experience years filter
        public int? MinExperienceYears { get; set; }
        public int? MaxExperienceYears { get; set; }
        
        // License class filter
        public string? LicenseClass { get; set; }
    }
}
