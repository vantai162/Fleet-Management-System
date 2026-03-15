using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FMS.Models
{
    public class Maintenance
    {
        [Key] public int MaintenanceID { get; set; }
        [ForeignKey("Vehicle")] public int VehicleID { get; set; }
        public Vehicle Vehicle { get; set; }

        public string? MaintenanceType { get; set; } 
        public string? Notes { get; set; }
        public DateTime? NextMaintenanceDate { get; set; }
        public int? NextMaintenanceKm { get; set; }
        public DateTime ScheduledDate { get; set; }
        public DateTime? FinishedDate { get; set; }
        [StringLength(200)]
        public string? GarageName { get; set; }

        [StringLength(100)]
        public string? TechnicianName { get; set; }

        public double TotalCost { get; set; } //TotalCost = SUM(MaintenanceItems.TotalPrice)

        [StringLength(20)] public string? MaintenanceStatus { get; set; }
        public ICollection<MaintenanceService>? MaintenanceServices { get; set; }

    }
}
