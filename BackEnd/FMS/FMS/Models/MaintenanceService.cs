using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class MaintenanceService
    {
        [Key]
        public int MaintenanceServiceID { get; set; }

        [ForeignKey(nameof(Maintenance))]
        public int MaintenanceID { get; set; }

        [ForeignKey(nameof(Service))]
        public int ServiceID { get; set; }

        public int Quantity { get; set; } = 1;

        public double UnitPrice { get; set; }   // giá tại thời điểm sửa
        public double TotalPrice { get; set; } //tổng giá = UnitPrice * Quantity

        public Maintenance Maintenance { get; set; }
        public Service Service { get; set; }
    }
}
