using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class EmergencyReport
    {
        [Key]
        public int EmergencyID { get; set; }

        // ===== LIÊN KẾT =====
        public int? TripID { get; set; }
        public Trip? Trip { get; set; }

        public int VehicleID { get; set; }
        public Vehicle Vehicle { get; set; }

        public int? DriverID { get; set; }
        public Driver? Driver { get; set; }

        // ===== THÔNG TIN SỰ CỐ =====
        [Required, StringLength(100)]
        public string Title { get; set; }        // Hỏng xe, Tai nạn...

        [Required]
        public string Description { get; set; }

        [Required, StringLength(20)]
        public string Level { get; set; }         // high | critical

        [Required, StringLength(20)]
        public string Status { get; set; }        // new | processing | resolved

        // ===== VỊ TRÍ =====
        public string Location { get; set; }

        // ===== LIÊN HỆ =====
        public string ContactPhone { get; set; }

        // ===== THỜI GIAN =====
        public DateTime ReportedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        // ===== XỬ LÝ =====
        public int? RespondedByUserID { get; set; } // điều phối / admin
    }

}
