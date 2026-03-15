namespace FMS.ServiceLayer.DTO.UserDto
{
    public class RegistrationOtpRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Purpose { get; set; } = "register";
    }

    public class RegistrationOtpVerificationDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string Purpose { get; set; } = "register";
    }
}
