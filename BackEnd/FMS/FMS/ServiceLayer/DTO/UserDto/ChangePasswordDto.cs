namespace FMS.ServiceLayer.DTO.UserDto
{
    public class ChangePasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
