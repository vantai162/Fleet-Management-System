namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class DriverHistoryDto
    {
        public DateTime TripDate { get; set; }

        public int DriverID { get; set; }
        public string DriverName { get; set; }

        public string VehiclePlate { get; set; }

        public string Route { get; set; }

        public int? DistanceKm { get; set; }

        public int? DurationMinutes { get; set; }

        public double? TripRating { get; set; }
    }
}
