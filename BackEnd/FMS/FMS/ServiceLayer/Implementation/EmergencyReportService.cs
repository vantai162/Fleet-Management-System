using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.EmergencyReportDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FMS.ServiceLayer.Implementation
{
    public class EmergencyReportService : IEmergencyReportService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmergencyReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

        }
        public async Task<PaginatedResult<EmergencyReportListDto>> GetAllAsync(EmergencyReportParams @params)
        {
            var query = _unitOfWork.EmergencyReports.Query()
                .Include(e => e.Vehicle)
                .Include(e => e.Driver)
                    .ThenInclude(d => d.User)
                .AsNoTracking(); // Tăng hiệu năng cho query chỉ đọc


            if (!string.IsNullOrEmpty(@params.Status))
            {
                query = query.Where(e => e.Status == @params.Status);
            }

            // Lọc theo Level (ví dụ: "high")
            if (!string.IsNullOrEmpty(@params.Level))
            {
                query = query.Where(e => e.Level == @params.Level);
            }


            // 1. Xử lý Dynamic Sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "level" => @params.IsDescending ? query.OrderByDescending(e => e.Level) : query.OrderBy(e => e.Level),
                    "status" => @params.IsDescending ? query.OrderByDescending(e => e.Status) : query.OrderBy(e => e.Status),
                    // Mặc định sort theo ReportedAt như code cũ của bạn
                    _ => @params.IsDescending ? query.OrderByDescending(e => e.ReportedAt) : query.OrderBy(e => e.ReportedAt)
                };
            }

            // 2. Map sang DTO (Lưu ý: chưa ToList ở đây để query vẫn là IQueryable)
            var dtoQuery = query.Select(e => new EmergencyReportListDto
            {
                Id = e.EmergencyID,
                Title = e.Title,
                Level = e.Level,
                Status = e.Status,
                Desc = e.Description,
                Location = e.Location,
                Contact = e.ContactPhone,
                Reporter = e.Driver != null ? e.Driver.User.FullName : "Không xác định",
                Driver = e.Driver != null ? e.Driver.User.FullName : "-",
                Vehicle = e.Vehicle != null ? e.Vehicle.LicensePlate + " - " + e.Vehicle.VehicleType : "-",
                ReportedAt = e.ReportedAt,
                RespondedAt = e.RespondedAt,
                ResolvedAt = e.ResolvedAt
            });

            // 3. Gọi phân trang tại đây (sử dụng Extension Method)
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<EmergencyReportListDto> CreateEmergencyReportAsync(CreateEmergencyReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new Exception("Emergency title is required");

            if (string.IsNullOrWhiteSpace(dto.Level))
                throw new Exception("Emergency level is required");

            if (string.IsNullOrWhiteSpace(dto.Location))
                throw new Exception("Location is required");

            if (string.IsNullOrWhiteSpace(dto.ContactPhone))
                throw new Exception("Contact phone is required");

            Trip? activeTrip = null;
            Driver? activeDriver = null;

            // ===============================
            // 1️⃣ AUTO-BIND TRIP BY VEHICLE
            // ===============================
            if (dto.VehicleID.HasValue)
            {
                activeTrip = await _unitOfWork.Trips
                    .Query()
                    .Include(t => t.TripDrivers)
                        .ThenInclude(td => td.Driver)
                    .FirstOrDefaultAsync(t =>
                        t.VehicleID == dto.VehicleID.Value &&
                        t.TripStatus == "In Progress");
            }

            // ===============================
            // 2️⃣ AUTO-BIND DRIVER
            // ===============================
            if (activeTrip != null)
            {
                // ưu tiên driver đang chạy trip
                activeDriver = activeTrip.TripDrivers?
                    .Select(td => td.Driver)
                    .FirstOrDefault();
            }
            else if (dto.DriverID.HasValue)
            {
                activeDriver = await _unitOfWork.Drivers
                    .GetByIdAsync(dto.DriverID.Value);
            }



            var report = new EmergencyReport
            {
                TripID = activeTrip?.TripID,
                VehicleID = dto.VehicleID ?? 0,
                DriverID = activeDriver?.DriverID,

                Title = dto.Title,
                Description = dto.Description,
                Level = dto.Level,

                Status = "processing",
                Location = dto.Location,
                ContactPhone = dto.ContactPhone,

                ReportedAt = DateTime.UtcNow
            };


            await _unitOfWork.EmergencyReports.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            return new EmergencyReportListDto
            {
                Id = report.EmergencyID,
                Title = report.Title,
                Level = report.Level,
                Status = report.Status,

                Desc = report.Description,
                Location = report.Location,
                Contact = report.ContactPhone,

                Reporter = activeDriver != null ? activeDriver.User.FullName : "Không xác định",
                Driver = activeDriver != null ? activeDriver.User.FullName : "-",

                Vehicle = report.Vehicle != null
                    ? report.Vehicle.LicensePlate + " - " + report.Vehicle.VehicleType
                    : "-",

                ReportedAt = report.ReportedAt,
                RespondedAt = report.RespondedAt ,
                ResolvedAt = report.ResolvedAt
            };
        }
        public async Task<EmergencyReportListDto> RespondEmergencyReportAsync(RespondEmergencyReportDto dto)
        {
            var report = await _unitOfWork.EmergencyReports
                .Query()
                .Include(e => e.Vehicle)
                .Include(e => e.Driver)
                    .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(e => e.EmergencyID == dto.EmergencyID);

            if (report == null)
                throw new Exception("Emergency report not found");

            if (report.Status == "resolved")
                throw new Exception("Emergency report already resolved");

            report.Status = "resolved";
            report.RespondedAt = DateTime.UtcNow;
            report.RespondedByUserID = dto.RespondedByUserID;
            report.ResolvedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            return new EmergencyReportListDto
            {
                Id = report.EmergencyID,
                Title = report.Title,
                Level = report.Level,
                Status = report.Status,

                Desc = report.Description,
                Location = report.Location,
                Contact = report.ContactPhone,

                Reporter = report.Driver != null ? report.Driver.User.FullName : "Không xác định",
                Driver = report.Driver != null ? report.Driver.User.FullName : "-",

                Vehicle = report.Vehicle != null
                    ? report.Vehicle.LicensePlate + " - " + report.Vehicle.VehicleType
                    : "-",

                ReportedAt = report.ReportedAt,
                RespondedAt = report.RespondedAt,
                ResolvedAt = report.ResolvedAt
            };
        }

      
        public async Task<EmergencyReportStatsDto> GetEmergencyReportStatsAsync()
        {
            var criticalReports = await _unitOfWork.EmergencyReports.Query().CountAsync(e => e.Level == "critical");
            var totalReports = await _unitOfWork.EmergencyReports.Query().CountAsync();
            var processingReports = await _unitOfWork.EmergencyReports.Query().CountAsync(e => e.Status == "processing");
            var resolvedReports = await _unitOfWork.EmergencyReports.Query().CountAsync(e => e.Status == "resolved");
            return new EmergencyReportStatsDto
            {
                total = totalReports,
                processing = processingReports,
                resolved = resolvedReports,
                critical = criticalReports
            };

        }
    }
}
