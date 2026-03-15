namespace FMS.Pagination
{
    public class EmergencyReportParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "ReportedAt";
        public bool IsDescending { get; set; } = true;

        // Các tiêu chí lọc
        public string? Status { get; set; }
        public string? Level { get; set; }
    }
}
