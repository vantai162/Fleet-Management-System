namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleListDto
    {
        public int VehicleID { get; set; }
        public string LicensePlate { get; set; }

        public string? VehicleType { get; set; }
        public string? VehicleModel { get; set; }
        public string? VehicleBrand { get; set; }
        public string? FuelType { get; set; }

        public int? ManufacturedYear { get; set; }
        public int? CurrentKm { get; set; }
        public string? VehicleStatus { get; set; }

        // ===== LICENSE REQUIREMENT =====
        public int RequiredLicenseClassID { get; set; }
        public string RequiredLicenseCode { get; set; }   // B2, C, D, E
        public string RequiredLicenseName { get; set; }   // Xe tải >3.5t
    }
}
