using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class CreateMaintenanceServiceDto
    {
        [Required]
        public int ServiceID { get; set; }

        public int Quantity { get; set; } = 1;

        // optional: cho phép FE override giá
        public double? UnitPrice { get; set; }
    }
}
