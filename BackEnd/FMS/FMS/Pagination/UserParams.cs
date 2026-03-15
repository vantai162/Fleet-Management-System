namespace FMS.Pagination
{
    public class UserParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "FullName";
        public bool IsDescending { get; set; } = true;

        // Các tiêu chí lọc
        public string? Role { get; set; }
        public string? Keyword { get; set; }
    }
}
