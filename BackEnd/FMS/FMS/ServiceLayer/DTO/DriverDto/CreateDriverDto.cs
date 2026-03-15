using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class CreateDriverDto
    {

        [Required] public string FullName { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }

        public string? GPLX { get; set; }
        public int ExperienceYears { get; set; }
        public List<CreateDriverLicenseDto> Licenses { get; set; }
        // Trạng thái: "Sẵn sàng", "Đang lái", "Nghỉ phép"...
        [StringLength(20)] public string DriverStatus { get; set; } = "available";

    }
}
