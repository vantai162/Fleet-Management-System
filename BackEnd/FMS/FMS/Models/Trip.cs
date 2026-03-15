using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FMS.Models
{
    public class Trip
    {
        [Key]
        public int TripID { get; set; }

        // ====== KHÓA NGOẠI ======

        [ForeignKey(nameof(Vehicle))]
        public int? VehicleID { get; set; }
        public Vehicle? Vehicle { get; set; }

       
        // ====== THÔNG TIN CHUYẾN ======

        // ====== THỜI GIAN ======
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }   // null nếu chưa xong
        public int? EstimatedDurationMin { get; set; }
        public int? ActualDurationMin { get; set; }

        // ====== LỘ TRÌNH ======
        [Required, StringLength(255)]
        public string StartLocation { get; set; }

        [Required, StringLength(255)]
        public string EndLocation { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? RouteGeometryJson { get; set; } // GeoJSON

        // ====== THỐNG KÊ ======
        public int? EstimatedDistanceKm { get; set; }
        public int? TotalDistanceKm { get; set; }
        public double? TotalFuelConsumed { get; set; }

        [Required, StringLength(20)]
        public string TripStatus { get; set; }
        // planned | waiting | in_transit | delivered | canceled


        // ====== KHÁCH HÀNG ======
        [StringLength(200)]
        public string? CustomerName { get; set; }

        [StringLength(20)]
        public string? CustomerPhone { get; set; }

        // ====== BOOKING INFO ======
        public DateTime? ScheduledStartTime { get; set; } // ngày + giờ đặt trước

        [StringLength(100)]
        public string? RequestedVehicleType { get; set; }

        public int? RequestedPassengers { get; set; }

        [StringLength(200)]
        public string? RequestedCargo { get; set; }

        [StringLength(200)]
        public string? CustomerEmail { get; set; }

        public ICollection<FuelRecord>? FuelRecords { get; set; }
        public ICollection<ExtraExpense>? ExtraExpenses { get; set; }
        public ICollection<TripLog>? TripLogs { get; set; }
        public ICollection<TripDriver> TripDrivers { get; set; }
        public ICollection<TripStep>? TripSteps { get; set; }
        public ICollection<EmergencyReport> EmergencyReports { get; set; }

    }
}
