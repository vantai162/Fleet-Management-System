using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FMS.Models
{
    public class DriverLicense
    {
        [Key]
        public int DriverLicenseID { get; set; }

        [ForeignKey(nameof(Driver))]
        public int DriverID { get; set; }
        public Driver Driver { get; set; }

        [ForeignKey(nameof(LicenseClass))]
        public int LicenseClassID { get; set; }
        public LicenseClass LicenseClass { get; set; }

        public DateTime ExpiryDate { get; set; }
    }
}
