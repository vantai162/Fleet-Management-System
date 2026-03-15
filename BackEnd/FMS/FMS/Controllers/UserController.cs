using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.UserDto;
using FMS.ServiceLayer.Implementation;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("fixed")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _environment;

        public UserController(IUserService userService, IWebHostEnvironment environment)
        {
            _userService = userService;
            _environment = environment;
        }

        // GET: api/user/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserParams @params)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(@params);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/user/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/user/email/{email}
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationRequest request)
        {
            try
            {
                var user = new User
                {
                    FullName = request.FullName,
                    Phone = request.Phone,
                    Email = request.Email,
                    BirthPlace = request.BirthPlace,
                    BirthDate = request.BirthDate
                };

                var registeredUser = await _userService.RegisterAsync(user, request.Password);
                return CreatedAtAction(nameof(GetById), new { id = registeredUser.UserID }, registeredUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendRegistrationOtp([FromBody] RegistrationOtpRequestDto dto)
        {
            try
            {
                var otp = await _userService.SendRegistrationOtpAsync(dto.Email, dto.Purpose);
                return Ok(new
                {
                    message = "Verification code sent to email.",
                    expiresInSeconds = 600,
                    devOtp = _environment.IsDevelopment() ? otp : null
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyRegistrationOtp([FromBody] RegistrationOtpVerificationDto dto)
        {
            try
            {
                await _userService.VerifyRegistrationOtpAsync(dto.Email, dto.Otp, dto.Purpose);
                return Ok(new { message = "Email verified successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/user/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                var (user, token) = await _userService.LoginAsync(request.Phone, request.Password);
                return Ok(new { user, token });
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message == "FIRST_LOGIN_OTP_REQUIRED" ||
                    ex.Message == "FIRST_LOGIN_EMAIL_REQUIRED")
                {
                    return StatusCode(403, new { error = ex.Message });
                }
                return Unauthorized(ex.Message);
            }
        }

        // POST: api/user/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                await _userService.ForgotPasswordAsync(dto.Email);
                return Ok(new { message = "OTP sent to email" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                var (user, token) = await _userService.ResetPasswordAsync(
                    dto.Email,
                    dto.Otp,
                    dto.NewPassword
                );
                return Ok(new
                {
                    message = "Password reset successfully",
                    user,
                    token
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/user/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                await _userService.ChangePasswordWithOtpAsync(dto.Email, dto.NewPassword);
                return Ok(new { message = "Password updated successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateUserProfileDto dto)
        {
            try
            {
                var result = await _userService.UpdateProfileAsync(id, dto);
                return result ? Ok(new { message = "Profile updated successfully" }) : BadRequest("Failed to update profile");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _userService.DeleteAccountAsync(id);
                return result ? Ok(new { message = "Account deleted successfully" }) : BadRequest("Failed to delete account");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/user/options/roles
        [HttpGet("options/roles")]
        public IActionResult GetUserRoles()
        {
            var roles = new[]
            {
                new { value = "admin", label = "Admin" },
                new { value = "manager", label = "Manager" },
                new { value = "staff", label = "Staff" }
            };
            return Ok(roles);
        }

        // GET: api/user/options/departments
        [HttpGet("options/departments")]
        public IActionResult GetDepartments()
        {
            var departments = new[]
            {
                new { value = "Logistics", label = "Logistics" },
                new { value = "Operations", label = "Operations" },
                new { value = "Maintenance", label = "Maintenance" },
                new { value = "Fleet", label = "Fleet" },
                new { value = "Dispatch", label = "Dispatch" },
                new { value = "IT", label = "IT" },
                new { value = "Safety", label = "Safety" },
                new { value = "Customer Service", label = "Customer Service" }
            };
            return Ok(departments);
        }

        // POST: api/avatar/upload/{userId}
        // Dùng chung cho cả thêm mới và cập nhật (Overwrite)
        [HttpPost("upload/{userId}")]
        public async Task<IActionResult> UploadAvatar(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });
            }

            try
            {
                // Giả sử hàm này trả về URL của ảnh sau khi upload thành công
                // Bạn nên sửa Service trả về string thay vì bool để frontend nhận được link ảnh
                var newAvatarUrl = await _userService.UploadAndSetAvatarAsync(userId, file);

                return Ok(new
                {
                    message = "Cập nhật ảnh đại diện thành công",
                    avatarUrl = newAvatarUrl
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // DELETE: api/avatar/delete/{userId}
        [HttpDelete("delete/{userId}")]
        public async Task<IActionResult> DeleteAvatar(int userId)
        {
            try
            {
                var success = await _userService.DeleteAvatarAsync(userId);

                if (!success)
                {
                    return BadRequest(new { message = "Không thể xóa ảnh đại diện hoặc người dùng không có ảnh" });
                }

                return Ok(new { message = "Xóa ảnh đại diện thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi hệ thống: " + ex.Message });
            }
        }

    }
}



