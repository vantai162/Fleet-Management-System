namespace FMS.ServiceLayer.DTO.VehicleDto
{
    public class VehicleMaintenanceDto
    {
        public int Id { get; set; }
        public string Type { get; set; } // Map từ MaintenanceStatus hoặc phân loại khác
        public string Description { get; set; } // Có thể lấy từ GarageName + Note
        public string Status { get; set; }
        public DateTime Date { get; set; }
        public double Cost { get; set; }
        public string? Notes { get; set; }
    }
}
