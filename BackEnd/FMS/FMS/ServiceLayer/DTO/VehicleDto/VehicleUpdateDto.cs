using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleUpdateDto
    {
        public string? LicensePlate { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleBrand { get; set; }
        public string? VehicleModel { get; set; }
        public int? ManufacturedYear { get; set; }
        public string? Capacity { get; set; }
        public int? CurrentKm { get; set; }
        public string? FuelType { get; set; }
        public string? VehicleStatus { get; set; }
        public int? DriverID { get; set; }
    }
}
