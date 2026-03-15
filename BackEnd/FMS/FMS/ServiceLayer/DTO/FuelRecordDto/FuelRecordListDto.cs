namespace FMS.ServiceLayer.DTO.FuelRecordDto
{
    public class FuelRecordListDto
    {
        public int FuelRecordID { get; set; }
        public int VehicleID { get; set; }
        public int DriverID { get; set; }
        public int? TripID { get; set; }
        public DateTime FuelTime { get; set; }
        public string? ReFuelLocation { get; set; }
        public double FuelAmount { get; set; }
        public double FuelCost { get; set; }
        public double? CurrentKm { get; set; }
        // Convenience fields for frontend
        public string? VehiclePlate { get; set; }
        public string? DriverName { get; set; }
        public string? Note { get; set; }
    }
}


