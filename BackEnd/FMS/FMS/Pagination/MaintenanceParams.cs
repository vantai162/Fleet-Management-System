namespace FMS.Pagination
{
    public class MaintenanceParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "MaintenanceType";
        public bool IsDescending { get; set; } = true;

        //Tieu chi loc
        public string? Keyword { get; set; }
        public string? MaintenanceType { get; set; }
        public string? MaintenanceStatus { get; set; }
        public int? Day { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }
}
