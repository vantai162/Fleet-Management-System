using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.UserDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace FMS.ServiceLayer.Implementation
{
    public class UserService: IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly CloudinaryService _cloudinary;
        private const string RegistrationOtpPrefix = "register_otp_";
        private const string RegistrationVerifiedPrefix = "register_verified_";
        private const string ProfileOtpPrefix = "profile_otp_";
        private const string ProfileVerifiedPrefix = "profile_verified_";
        private const string PasswordOtpPrefix = "password_otp_";
        private const string PasswordVerifiedPrefix = "password_verified_";
        public UserService(IUnitOfWork unitOfWork, IMemoryCache cache, IEmailService emailService, IConfiguration configuration,CloudinaryService cloudinary)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _cloudinary = cloudinary ?? throw new ArgumentNullException(nameof(cloudinary));
        }

        private static string NormalizeEmail(string email)
        {
            return (email ?? string.Empty).Trim().ToLowerInvariant();
        }

        private static string GenerateOtpCode()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
        }

        private static string NormalizePurpose(string purpose)
        {
            var normalized = (purpose ?? string.Empty).Trim().ToLowerInvariant();
            return string.IsNullOrWhiteSpace(normalized) ? "register" : normalized;
        }

        private static string ResolveOtpPrefix(string purpose)
        {
            return purpose switch
            {
                "password" => PasswordOtpPrefix,
                "profile" => ProfileOtpPrefix,
                "email-change" => ProfileOtpPrefix,
                _ => RegistrationOtpPrefix
            };
        }

        private static string ResolveVerifiedPrefix(string purpose)
        {
            return purpose switch
            {
                "password" => PasswordVerifiedPrefix,
                "profile" => ProfileVerifiedPrefix,
                "email-change" => ProfileVerifiedPrefix,
                _ => RegistrationVerifiedPrefix
            };
        }

        private string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
            var issuer = jwtSettings["Issuer"] ?? "FMS";
            var audience = jwtSettings["Audience"] ?? "FMSUsers";
            var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "1440");

            var key = Encoding.UTF8.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role ?? "staff"),
                    new Claim(ClaimTypes.MobilePhone, user.Phone)
                }),
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        public async Task<PaginatedResult<User>> GetAllUsersAsync(UserParams @params)
        {
            // Kh?i t?o query t? UnitOfWork
            var query = _unitOfWork.Users.Query().AsNoTracking();

            // --- BU?C 1: L?C (FILTERING) ---
            
            // L?c theo Keyword (tên, email, SÐT)
            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.ToLower();
                query = query.Where(u => 
                    (u.FullName != null && u.FullName.ToLower().Contains(keyword)) ||
                    (u.Email != null && u.Email.ToLower().Contains(keyword)) ||
                    (u.Phone != null && u.Phone.Contains(@params.Keyword))
                );
            }
            
            // L?c theo Role
            if (!string.IsNullOrEmpty(@params.Role))
            {
                query = query.Where(u => u.Role == @params.Role);
            }

            // --- BU?C 2: S?P X?P (SORTING) ---
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "fullname" => @params.IsDescending ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
                    "role" => @params.IsDescending ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
                    "email" => @params.IsDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                    // M?c d?nh s?p x?p theo FullName ho?c Id
                    _ => @params.IsDescending ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName)
                };
            }
            else
            {
                query = query.OrderBy(u => u.FullName); // Luôn c?n OrderBy tru?c khi Paginate
            }

            // --- BU?C 3: PHÂN TRANG (PAGINATION) ---
           
            return await query.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<User> GetByIdAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var normalizedEmail = NormalizeEmail(email);
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> GetByPhoneAsync(string phone)
        {
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Phone == phone);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> RegisterAsync(User user, string password)
        {


            user.Email = user.Email?.Trim().ToLower();
            user.FullName = user.FullName?.Trim() ?? string.Empty;
            user.Phone = user.Phone.Trim();
            user.Role = string.IsNullOrWhiteSpace(user.Role) ? "staff" : user.Role;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.RegisteredAt = DateTime.UtcNow;
            user.BirthPlace = user.BirthPlace?.Trim();
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

         

            return user;
        }

        public async Task<(User user, string token)> LoginAsync(string phone, string password)
        {
            var user = await GetByPhoneAsync(phone);
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new InvalidOperationException("Invalid credentials");

            if (user.LastLoginAt == null)
            {
                if (string.IsNullOrWhiteSpace(user.Email))
                    throw new InvalidOperationException("FIRST_LOGIN_EMAIL_REQUIRED");

                throw new InvalidOperationException("FIRST_LOGIN_OTP_REQUIRED");
            }

            user.LastLoginAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            var token = GenerateToken(user);
            return (user, token);
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
        {
            var user = await GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Ch? update khi có d? li?u (KHÔNG overwrite null)
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Department))
                user.Department = dto.Department.Trim();


            if (!string.IsNullOrWhiteSpace(dto.Phone))
                user.Phone = dto.Phone;

            if (!string.IsNullOrWhiteSpace(dto.Role))
                user.Role = dto.Role;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            // ? AVATAR
            if (!string.IsNullOrWhiteSpace(dto.Avatar))
                user.Avatar = dto.Avatar;

            if (!string.IsNullOrWhiteSpace(dto.BirthPlace))
                user.BirthPlace = dto.BirthPlace.Trim();

            if (dto.BirthDate.HasValue)
                user.BirthDate = dto.BirthDate.Value;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetEmailForFirstLoginAsync(string phone, string password, string email)
        {
            if (string.IsNullOrWhiteSpace(phone) ||
                string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(email))
            {
                throw new InvalidOperationException("Phone, password, and email are required");
            }

            var user = await GetByPhoneAsync(phone);
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new InvalidOperationException("Invalid credentials");

            if (!string.IsNullOrWhiteSpace(user.Email))
                throw new InvalidOperationException("Email already exists");

            var normalizedEmail = NormalizeEmail(email);
            var exists = await _unitOfWork.Users.Query()
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (exists)
                throw new InvalidOperationException("Email is already registered");

            user.Email = normalizedEmail;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }


        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new InvalidOperationException("User not found");

            // Sinh OTP
            var otp = GenerateOtpCode();

            // Luu OTP vào cache v?i th?i h?n 5 phút
            _cache.Set($"otp_{email}", otp, TimeSpan.FromMinutes(5));

            // G?i email
            await _emailService.SendAsync(email, "Password Reset OTP", $"Your OTP code is {otp}");

            return true;
        }

        public async Task<(User user, string token)> ResetPasswordAsync(string email, string otp, string newPassword)
        {
            // Ki?m tra OTP trong cache
            if (!_cache.TryGetValue($"otp_{email}", out string cachedOtp) || cachedOtp != otp)
                throw new InvalidOperationException("Invalid or expired OTP");

            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new InvalidOperationException("User not found");

            // Hash m?t kh?u m?i
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.LastLoginAt = DateTime.UtcNow;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove($"otp_{email}");

            var token = GenerateToken(user);
            return (user, token);
        }

        public async Task<bool> DeleteAccountAsync(int userId)
        {
            var user = await GetByIdAsync(userId);
            if (user == null) return false;

            _unitOfWork.Users.Remove(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        //dang ky gui otp va xac thuc
        public async Task<string> SendRegistrationOtpAsync(string email, string purpose = "register")
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidOperationException("Email is required");

            var normalizedPurpose = NormalizePurpose(purpose);
            var normalizedEmail = NormalizeEmail(email);

            var alreadyExists = await _unitOfWork.Users.Query()
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (normalizedPurpose == "password")
            {
                if (!alreadyExists)
                    throw new InvalidOperationException("User not found");
            }
            else
            {
                if (alreadyExists)
                    throw new InvalidOperationException("Email is already registered");
            }

            var otp = GenerateOtpCode();

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };

            var otpKey = $"{ResolveOtpPrefix(normalizedPurpose)}{normalizedEmail}";
            var verifiedKey = $"{ResolveVerifiedPrefix(normalizedPurpose)}{normalizedEmail}";
            _cache.Set(otpKey, otp, cacheOptions);
            _cache.Remove(verifiedKey);

            var subject = normalizedPurpose switch
            {
                "password" => "FMS password change verification",
                "profile" => "FMS profile update verification",
                "email-change" => "FMS email update verification",
                _ => "Verify your FMS account"
            };
            var body = $"<p>Your FMS verification code is <strong>{otp}</strong>.</p><p>This code expires in 10 minutes.</p>";
            await _emailService.SendAsync(email, subject, body);

            return otp;
        }

        public async Task<bool> VerifyRegistrationOtpAsync(string email, string otp, string purpose = "register")
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
                throw new InvalidOperationException("Email and OTP are required");

            var normalizedPurpose = NormalizePurpose(purpose);
            var normalizedEmail = NormalizeEmail(email);
            var otpKey = $"{ResolveOtpPrefix(normalizedPurpose)}{normalizedEmail}";
            var verifiedKey = $"{ResolveVerifiedPrefix(normalizedPurpose)}{normalizedEmail}";

            if (!_cache.TryGetValue(otpKey, out string cachedOtp))
                throw new InvalidOperationException("OTP has expired or is invalid");

            if (!string.Equals(cachedOtp, otp, StringComparison.Ordinal))
                throw new InvalidOperationException("OTP is incorrect");

            _cache.Remove(otpKey);
            _cache.Set(verifiedKey, true, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            });

            return true;
        }

        public async Task<bool> ChangePasswordWithOtpAsync(string email, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(newPassword))
                throw new InvalidOperationException("Email and new password are required");

            var normalizedEmail = NormalizeEmail(email);
            var verifiedKey = $"{PasswordVerifiedPrefix}{normalizedEmail}";

            if (!_cache.TryGetValue(verifiedKey, out bool verified) || !verified)
                throw new InvalidOperationException("OTP verification is required");

            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null)
                throw new InvalidOperationException("User not found");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove(verifiedKey);

            return true;
        }

        public async Task<string> UploadAndSetAvatarAsync(int userId, IFormFile file)
        {
            var user = await GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (file == null || file.Length == 0)
                throw new InvalidOperationException("File is required");

            if (!string.IsNullOrEmpty(user.Avatar))
            {
                var publicId = GetPublicIdFromUrl(user.Avatar);
                await _cloudinary.DestroyAsync(new DeletionParams(publicId));
            }

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "avatars",
                Transformation = new Transformation()
                                    .Width(300)
                                    .Height(300)
                                    .Crop("fill")
                                    .Gravity("face")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            user.Avatar = uploadResult.SecureUrl.ToString();

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            return user.Avatar;
        }
        private string GetPublicIdFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return null;

            // Ví d? URL: https://res.cloudinary.com/demo/image/upload/v12345/avatars/abc123.jpg
            // Public ID s? là: avatars/abc123
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');
            var fileName = segments.Last();
            var publicIdWithoutExtension = Path.GetFileNameWithoutExtension(fileName);

            // N?u b?n luu trong folder "avatars", c?n c?ng thêm tên folder
            return $"avatars/{publicIdWithoutExtension}";
        }

        public async Task<bool> DeleteAvatarAsync(int userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("Không tìm th?y ngu?i dùng");

            if (string.IsNullOrEmpty(user.Avatar)) return true; // Ðã không có ?nh r?i

            // 1. Xóa ?nh trên Cloudinary
            var publicId = GetPublicIdFromUrl(user.Avatar);
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Result == "ok")
            {
                // 2. C?p nh?t database thành null ho?c chu?i r?ng
                user.Avatar = null;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }

            return false;
        }

    }
}

