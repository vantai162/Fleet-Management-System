using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class UpdateMaintenanceDto
    {
        [Required]
        public int MaintenanceID { get; set; }

        public int? VehicleID { get; set; }

        [StringLength(100)]
        public string? MaintenanceType { get; set; }

        public DateTime? ScheduledDate { get; set; }

        [StringLength(200)]
        public string? GarageName { get; set; }

        [StringLength(100)]
        public string? TechnicianName { get; set; }

        public string? Notes { get; set; }

        public DateTime? NextMaintenanceDate { get; set; }
        public int? NextMaintenanceKm { get; set; }

        [StringLength(50)]
        public string? MaintenanceStatus { get; set; } // scheduled, in-progress, completed

        public List<CreateMaintenanceServiceDto>? Services { get; set; }
    }
}
