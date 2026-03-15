namespace FMS.ServiceLayer.DTO.FuelRecordDto
{
    public class CreateFuelRecordDto
    {
        public int VehicleID { get; set; }
        public int? DriverID { get; set; }
        public int? TripID { get; set; }
        public DateTime FuelTime { get; set; }
        public string? ReFuelLocation { get; set; }
        public double FuelAmount { get; set; }
        public double FuelCost { get; set; }
        public double? CurrentKm { get; set; }
    }
}


