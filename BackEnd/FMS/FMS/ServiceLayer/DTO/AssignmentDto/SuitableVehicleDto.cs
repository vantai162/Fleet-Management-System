namespace FMS.ServiceLayer.DTO.AssignmentDto
{
    public class SuitableVehicleDto
    {
        public int VehicleId { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
