using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FMS.Models
{
    public class FuelRecord
    {
        [Key]
        public int FuelRecordID { get; set; }

        // ====== KHÓA NGOẠI ======
        [ForeignKey(nameof(Vehicle))]
        public int VehicleID { get; set; }
        public Vehicle Vehicle { get; set; }

        [ForeignKey(nameof(Driver))]
        public int DriverID { get; set; }
        public Driver Driver { get; set; }

        [ForeignKey(nameof(Trip))]
        public int? TripID { get; set; }   // có thể null
        public Trip? Trip { get; set; }

        // ====== THÔNG TIN ĐỔ XĂNG ======
        public DateTime FuelTime { get; set; }

        [StringLength(200)]
        public string ReFuelLocation { get; set; }

        public double FuelAmount { get; set; }     // Lít
        public double FuelCost { get; set; }       // VNĐ

        public double CurrentKm { get; set; }      // Km tại thời điểm đổ

        
        
    }
}
