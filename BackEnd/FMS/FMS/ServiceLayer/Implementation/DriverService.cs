using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.DriverDto;
using FMS.ServiceLayer.DTO.EmergencyReportDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FMS.ServiceLayer.Implementation
{
    public class DriverService : IDriverService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserService _userService;
        private readonly ILogger<DriverService> _logger; // Thêm Logger

        public DriverService(IUnitOfWork unitOfWork, IUserService userService,ILogger<DriverService> logger)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
            _logger = logger;
        }

        public async Task<PaginatedResult<DriverListDto>> GetDriversAsync(DriverParams @params)
        {
            var query = _unitOfWork.Drivers.Query()
                .Include(d => d.DriverLicenses).ThenInclude(dl => dl.LicenseClass)
                .Include(d => d.TripDrivers)
                    .ThenInclude(td => td.Trip)
                    .ThenInclude(t => t.Vehicle)
                .Include(d => d.User)
                .AsNoTracking(); // Tăng hiệu năng cho query chỉ đọc

            // Filter by status
            if (!string.IsNullOrEmpty(@params.DriverStatus))
            {
                query = query.Where(e => e.DriverStatus == @params.DriverStatus);
            }

            // Search by keyword (name, phone, email)
            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.ToLower();
                query = query.Where(d => 
                    (d.User.FullName != null && d.User.FullName.ToLower().Contains(keyword)) ||
                    (d.User.Phone != null && d.User.Phone.ToLower().Contains(keyword)) ||
                    (d.User.Email != null && d.User.Email.ToLower().Contains(keyword))
                );
            }

            // Filter by rating range
            if (@params.MinRating.HasValue)
            {
                query = query.Where(d => d.Rating != null && d.Rating >= @params.MinRating.Value);
            }
            if (@params.MaxRating.HasValue)
            {
                query = query.Where(d => d.Rating != null && d.Rating <= @params.MaxRating.Value);
            }

            // Filter by experience years range
            if (@params.MinExperienceYears.HasValue)
            {
                query = query.Where(d => d.ExperienceYears != null && d.ExperienceYears >= @params.MinExperienceYears.Value);
            }
            if (@params.MaxExperienceYears.HasValue)
            {
                query = query.Where(d => d.ExperienceYears != null && d.ExperienceYears <= @params.MaxExperienceYears.Value);
            }

            // Filter by license class
            if (!string.IsNullOrEmpty(@params.LicenseClass))
            {
                query = query.Where(d => d.DriverLicenses.Any(dl => dl.LicenseClass.Code == @params.LicenseClass));
            }

            // 1. Xử lý Dynamic Sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "experience" => @params.IsDescending ? query.OrderByDescending(e => e.ExperienceYears) : query.OrderBy(e => e.ExperienceYears),
                    "status" => @params.IsDescending ? query.OrderByDescending(e => e.DriverStatus) : query.OrderBy(e => e.DriverStatus),
                    "rating" => @params.IsDescending ? query.OrderByDescending(e => e.Rating) : query.OrderBy(e => e.Rating),
                    _ => @params.IsDescending ? query.OrderByDescending(e => e.User.FullName) : query.OrderBy(e => e.User.FullName)
                };
            }
            else
            {
                query = query.OrderBy(e => e.User.FullName);
            }

            var dtoQuery = query.Select(d => new DriverListDto
                {
                    DriverID = d.DriverID,
                    Name = d.User.FullName,
                    Avatar = d.User.Avatar,
                    Phone = d.User.Phone,
                    Email = d.User.Email,
                    ExperienceYears = d.ExperienceYears,

                    Licenses = d.DriverLicenses
                                .Select(l => l.LicenseClass.Code)
                                .Distinct()
                                .ToList(),

                    AssignedVehicle = d.TripDrivers
                        .Where(td => td.Trip.TripStatus == "In Progress") // Lấy chuyến đang chạy
                        .OrderByDescending(td => td.Trip.StartTime)
                        .Select(td => td.Trip.Vehicle.LicensePlate)
                        .FirstOrDefault() ?? "Đang rảnh",

                    TotalTrips = d.TotalTrips,
                    Rating = d.Rating,
                    Status = d.DriverStatus ?? "Active"
                });
            _logger.LogInformation(_logger.IsEnabled(LogLevel.Information)
                ? $"GetDriversAsync executed with {dtoQuery.Count()} drivers found."
                : "GetDriversAsync executed.");
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);

        }

        public async Task<List<DriverHistoryDto>> GetDriverHistoryAsync(int driverId)
        {
            if (driverId == null)
                throw new ArgumentException("Driver id not found");
            var history = await _unitOfWork.TripDrivers.Query()
                    .Where(td => td.DriverID == driverId)
                    .Include(td => td.Driver)
                        .ThenInclude(d => d.User)
                    .Include(td => td.Trip)
                        .ThenInclude(t => t.Vehicle)
                    .Select(td => new DriverHistoryDto
                    {
                        DriverID = td.DriverID,
                        TripDate = td.Trip.StartTime,
                        DriverName = td.Driver.User.FullName,
                        VehiclePlate = td.Trip.Vehicle.LicensePlate,
                        Route = td.Trip.StartLocation + " - " + td.Trip.EndLocation,
                        DistanceKm = td.Trip.TotalDistanceKm,
                        DurationMinutes = td.Trip.EndTime != null
                            ? EF.Functions.DateDiffMinute(td.Trip.StartTime, td.Trip.EndTime)
                            : (int?)null,
                        TripRating = td.TripRating
                    })
                    .OrderByDescending(x => x.TripDate)
                    .ToListAsync();
            return history;
        }

        public async Task<DriverDetailsDto> GetDriverDetailsAsync(int driverId)
        {
            if (driverId == null)
                throw new ArgumentException("Driver id not found");
            var createdDriver = await _unitOfWork.Drivers
                .Query()
                .Include(d => d.DriverLicenses)
                    .ThenInclude(dl => dl.LicenseClass)
                .Include(d => d.User)
                .FirstAsync(d => d.DriverID == driverId);

            // ===== MAP RESPONSE =====
            return new DriverDetailsDto
            {
                DriverID = createdDriver.DriverID,
                FullName = createdDriver.User.FullName,
                Phone = createdDriver.User.Phone,
                Email = createdDriver.User.Email,
                BirthPlace = createdDriver.User.BirthPlace,
                BirthDate = createdDriver.User.BirthDate,
                GPLX = createdDriver.GPLX,
                ExperienceYears = createdDriver.ExperienceYears,
                TotalTrips = createdDriver.TotalTrips,
                Rating = createdDriver.Rating,
                DriverStatus = createdDriver.DriverStatus,

                Licenses = createdDriver.DriverLicenses.Select(dl => new DriverLicenseDto
                {
                    LicenseClassID = dl.LicenseClassID,
                    LicenseClassName = dl.LicenseClass.Code,
                    ExpiryDate = dl.ExpiryDate
                }).ToList()
            };
        }


        public async Task<Driver> CreateDriverAsync(int userId,CreateDriverDto dto)
        {
            // ===== VALIDATION ==
            if (dto.Licenses == null || !dto.Licenses.Any())
                throw new Exception("Driver must have at least one license");

            // ===== CREATE DRIVER =====
            var driver = new Driver
            {
                UserID = userId,
                ExperienceYears = dto.ExperienceYears,
                GPLX = dto.GPLX,

                TotalTrips = 0,
                Rating = null,
                DriverStatus = "available"

            };

            await _unitOfWork.Drivers.AddAsync(driver);
            await _unitOfWork.SaveChangesAsync(); // lấy DriverID

            // ===== CREATE LICENSES =====
            var licenses = dto.Licenses.Select(l => new DriverLicense
            {
                DriverID = driver.DriverID,
                LicenseClassID = l.LicenseClassID,
                ExpiryDate = l.ExpiryDate
            }).ToList();

            await _unitOfWork.DriverLicenses.AddRangeAsync(licenses);
            await _unitOfWork.SaveChangesAsync();

            return driver;
        }


        public async Task<DriverDetailsDto> RegisterDriverAsync(RegisterDriverDto dto)
        {
            
                // 1️⃣ Create User
                var user = await _userService.RegisterAsync(new User
                {
                    FullName = dto.FullName.Trim(),
                    Phone = dto.Phone.Trim(),
                    Email = dto.Email?.Trim(),
                    Role = "driver",
                    BirthPlace = dto.BirthPlace?.Trim(),
                    BirthDate = dto.BirthDate

                }, dto.Password);

                // 2️⃣ Create Driver Profile
                var driver = await CreateDriverAsync(user.UserID, dto);

                // 3️⃣ Load full
                var createdDriver = await _unitOfWork.Drivers
                    .Query()
                    .Include(d => d.User)
                    .Include(d => d.DriverLicenses)
                        .ThenInclude(dl => dl.LicenseClass)
                    .FirstAsync(d => d.DriverID == driver.DriverID);


                // ===== MAP RESPONSE =====
                return new DriverDetailsDto
                {
                    DriverID = createdDriver.DriverID,
                    FullName = createdDriver.User.FullName,
                    Phone = createdDriver.User.Phone,
                    Email = createdDriver.User.Email,
                    BirthPlace = createdDriver.User.BirthPlace,
                    BirthDate = createdDriver.User.BirthDate,
                    GPLX = createdDriver.GPLX,
                    ExperienceYears = createdDriver.ExperienceYears,
                    TotalTrips = createdDriver.TotalTrips,
                    Rating = createdDriver.Rating,
                    DriverStatus = createdDriver.DriverStatus,

                    Licenses = createdDriver.DriverLicenses.Select(dl => new DriverLicenseDto
                    {
                        LicenseClassID = dl.LicenseClassID,
                        LicenseClassName = dl.LicenseClass.Code,
                        ExpiryDate = dl.ExpiryDate
                    }).ToList()
                };
            
        }

        public async Task UpdateDriverRatingAsync(int driverId)
        {
            var driver = await _unitOfWork.Drivers.Query()
                .Include(d => d.TripDrivers)
                .ThenInclude(td => td.Trip)
                .FirstOrDefaultAsync(d => d.DriverID == driverId);

            if (driver == null)
            {
                _logger.LogWarning("Không tìm thấy tài xế với ID: {DriverId} để cập nhật Rating.", driverId);
                throw new Exception("Driver not found");
            }

            var completedTrips = driver.TripDrivers
                .Where(td => td.Trip.TripStatus == "Completed" && td.TripRating.HasValue)
                .ToList();

            if (completedTrips.Count == 0)
            {
                driver.Rating = null;
            }
            else
            {
                driver.Rating = completedTrips.Average(td => td.TripRating.Value);
            }
            _unitOfWork.Drivers.Update(driver);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<bool> UpdateDriverAsync(int driverId, UpdateDriverDto dto)
        {
            _logger.LogInformation("Yêu cầu cập nhật thông tin tài xế ID: {DriverId}", driverId);
            var driver = await _unitOfWork.Drivers.GetByIdAsync(driverId);
            if (driver == null)
            {
                _logger.LogWarning("Cập nhật thất bại: Không tìm thấy tài xế ID {DriverId}", driverId);
                return false;
            }

            if (!string.IsNullOrEmpty(dto.FullName))
                driver.User.FullName = dto.FullName.Trim();
            if (!string.IsNullOrEmpty(dto.Phone))
                driver.User.Phone = dto.Phone.Trim();
            if (!string.IsNullOrEmpty(dto.Email))
                driver.User.Email = dto.Email.Trim();
            if (!string.IsNullOrEmpty(dto.BirthPlace))
                driver.User.BirthPlace = dto.BirthPlace.Trim();
            if (dto.ExperienceYears.HasValue)
                driver.ExperienceYears = dto.ExperienceYears.Value;
            if (!string.IsNullOrEmpty(dto.DriverStatus))
                driver.DriverStatus = dto.DriverStatus;

            try
            {
                _unitOfWork.Drivers.Update(driver);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Cập nhật thông tin tài xế {DriverId} thành công vào Database.", driverId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra khi lưu thay đổi cho tài xế {DriverId}", driverId);
                throw; // Để Middleware xử lý tiếp
            }
         
        }

        public async Task<bool> DeleteDriverAsync(int driverId)
        {
            var driver = await _unitOfWork.Drivers.GetByIdAsync(driverId);
            if (driver == null) return false;

            _unitOfWork.Drivers.Remove(driver);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
