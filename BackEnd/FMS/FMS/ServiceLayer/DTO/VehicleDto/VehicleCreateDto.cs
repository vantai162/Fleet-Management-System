using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleCreateDto
    {
        [Required] public string LicensePlate { get; set; } = string.Empty; 
        [Required] public string VehicleType { get; set; } = string.Empty; 
        [Required] public string VehicleBrand { get; set; } = string.Empty;
        [Required] public string VehicleModel { get; set; } = string.Empty;
        [Required] public int ManufacturedYear { get; set; }
        [Required] public string Capacity { get; set; } = string.Empty;
        [Required] public int CurrentKm { get; set; }
        [Required] public string FuelType { get; set; } = string.Empty;
        [Required] public string VehicleStatus { get; set; } = "Sẵn sàng"; // Nếu cần gán driver ngay khi tạo
        //public int? DriverID { get; set; } // Nếu cần gán license requirement
        
    }
}
