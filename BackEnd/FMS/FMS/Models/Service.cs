using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class Service
    {
        [Key]
        public int ServiceID { get; set; }

        [Required, StringLength(200)]
        public string ServiceName { get; set; }

        [StringLength(50)]
        public string ServiceType { get; set; }
        // Maintenance | Repair | Inspection

        public double ServicePrice { get; set; }
    }
}