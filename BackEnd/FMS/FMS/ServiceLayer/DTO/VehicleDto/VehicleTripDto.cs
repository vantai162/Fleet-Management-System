namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleTripDto
    {
        public int Id { get; set; }
        public string StartLocation { get; set; }
        public string EndLocation { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public int? Distance { get; set; }
        public string DriverName { get; set; } // Lấy từ Trip.Driver.FullName
    }
}
