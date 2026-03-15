using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.UserDto
{
    public class FirstLoginEmailRequestDto
    {
        [Required] public string Phone { get; set; }
        [Required] public string Password { get; set; }
        [Required, EmailAddress] public string Email { get; set; }
    }
}
