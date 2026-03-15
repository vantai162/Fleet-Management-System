namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleDetailDto
    {
        // Thông tin cơ bản (Khớp với React state 'vehicle')
        public string Id { get; set; }
        public string PlateNumber { get; set; } // Map từ LicensePlate
        public string Brand { get; set; }       // Bạn có thể tách từ VehicleModel
        public string Model { get; set; }       // Map từ VehicleModel
        public string Status { get; set; }      // Map từ VehicleStatus
        public string Type { get; set; }        // Map từ VehicleType
        public int Year { get; set; }           // Map từ ManufacturedYear
        public int? Mileage { get; set; }       // Map từ CurrentKm
        public string Capacity { get; set; }    // Ví dụ: "2.5 tons" (bạn có thể thêm trường này nếu cần)

        public string FuelType { get; set; }    // Map từ FuelType

        public string RequiredLicense { get; set; } // Map từ RequiredLicense

        // Thông tin tài xế (Khớp với assignedDriver)
        public string? AssignedDriverId { get; set; }
        public string? AssignedDriverName { get; set; }

        // Danh sách cho các Tab
        public List<VehicleTripDto> Trips { get; set; } = new();
        public List<VehicleMaintenanceDto> Maintenances { get; set; } = new();
    }
}
