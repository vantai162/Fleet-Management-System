using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class CreateMaintenanceDto
    {
        [Required]
        public int VehicleID { get; set; }

        [Required, StringLength(100)]
        public string MaintenanceType { get; set; }   // Bảo dưỡng / Sửa chữa / Thay thế

        [Required]
        public DateTime ScheduledDate { get; set; }

        [StringLength(200)]
        public string? GarageName { get; set; }

        [StringLength(100)]
        public string? TechnicianName { get; set; }

        public string? Notes { get; set; }

        public DateTime? NextMaintenanceDate { get; set; }
        public int? NextMaintenanceKm { get; set; }

        public List<CreateMaintenanceServiceDto> Services { get; set; } = new();

        // FE gửi status, nhưng backend nên kiểm soát
        public string? MaintenanceStatus { get; set; } // optional
    }
}
