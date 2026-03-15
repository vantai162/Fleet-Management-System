namespace FMS.Pagination
{
    public class FuelRecordParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "FuelTime";
        public bool IsDescending { get; set; } = true;

        // Filtering criteria
        public int? TripID { get; set; }
        public int? VehicleID { get; set; }
        public int? DriverID { get; set; }

        // Optional date range filter (UTC)
        public DateTime? FromFuelTime { get; set; }
        public DateTime? ToFuelTime { get; set; }
    }
}

