using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class LicenseClass
    {
        [Key]
        public int LicenseClassID { get; set; }

        [Required, StringLength(10)]
        public string Code { get; set; }   // B2, C, D, FC, FD...
        public int Rank { get; set; }    // 1, 2, 3, 4...

        [StringLength(200)]
        public string? LicenseDescription { get; set; }
    }
}
