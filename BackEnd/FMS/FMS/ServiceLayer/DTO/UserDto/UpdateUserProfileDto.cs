using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.UserDto
{
    public class UpdateUserProfileDto
    {
        [StringLength(200)] public string? FullName { get; set; }
        [StringLength(200)] public string? Email { get; set; }
        [StringLength(20)] public string? Role { get; set; }
        public string? Department { get; set; }
        [StringLength(20)] public string? Phone { get; set; }

        [StringLength(100)] public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }

        public string? Avatar { get; set; }
    }
}
