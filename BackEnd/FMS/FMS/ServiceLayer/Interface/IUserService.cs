using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.UserDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IUserService
    {
        Task<PaginatedResult<User>> GetAllUsersAsync(UserParams @params);
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task<User> RegisterAsync(User user, string password);
        Task<(User user, string token)> LoginAsync(string email, string password);
        Task<bool> UpdateProfileAsync(int userId, UpdateUserProfileDto dto);
        Task<bool> SetEmailForFirstLoginAsync(string phone, string password, string email);
        Task<bool> DeleteAccountAsync(int userId);
        Task<bool> ForgotPasswordAsync(string email);
        Task<(User user, string token)> ResetPasswordAsync(string email, string otp, string newPassword);
        Task<string> SendRegistrationOtpAsync(string email, string purpose = "register");
        Task<bool> VerifyRegistrationOtpAsync(string email, string otp, string purpose = "register");
        Task<bool> ChangePasswordWithOtpAsync(string email, string newPassword);
        Task<string> UploadAndSetAvatarAsync(int userId, IFormFile file);
        Task<bool> DeleteAvatarAsync(int userId);
    }
}
