using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.TripDto
{
    public class CreateBookingTripDto
    {
        // ===== KHÁCH HÀNG =====
        [Required, StringLength(200)]
        public string CustomerName { get; set; }

        [Required, StringLength(20)]
        public string CustomerPhone { get; set; }

        [EmailAddress, StringLength(200)]
        public string? CustomerEmail { get; set; }

        // ===== LỘ TRÌNH =====
        [Required, StringLength(255)]
        public string StartLocation { get; set; }

        [Required, StringLength(255)]
        public string EndLocation { get; set; }
        public string? RouteGeometryJson { get; set; }

        // ===== ƯỚC TÍNH =====
        public int? EstimatedDistanceKm { get; set; }
        public int? EstimatedDurationMin { get; set; }

        // ===== THỜI GIAN ĐẶT =====
        [Required]
        public DateTime ScheduledStartTime { get; set; }

        // Optional: allow assigning a vehicle at creation
        public int? VehicleID { get; set; }

        // ===== YÊU CẦU PHƯƠNG TIỆN =====
        [StringLength(100)]
        public string RequestedVehicleType { get; set; }

        public int? RequestedPassengers { get; set; }

        [StringLength(200)]
        public string? RequestedCargo { get; set; }

        // ===== GHI CHÚ =====
        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
