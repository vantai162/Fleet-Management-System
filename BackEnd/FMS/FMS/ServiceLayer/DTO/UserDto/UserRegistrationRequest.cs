namespace FMS.ServiceLayer.DTO.UserDto
{
    // DTOs for request/response
    public class UserRegistrationRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }

    }
}
