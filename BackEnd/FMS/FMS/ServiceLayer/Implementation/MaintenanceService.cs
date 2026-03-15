using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.MaintenanceDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;

namespace FMS.ServiceLayer.Implementation
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MaintenanceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<ServiceDto>> GetAllServiceAsync()
        {
            var services = await _unitOfWork.Services.Query()
                .Select(s => new ServiceDto
                {
                    Id = s.ServiceID,
                    Name = s.ServiceName,
                    Price = s.ServicePrice,
                    Category = s.ServiceType
                }).ToListAsync();
            return services;
        }

        public async Task<PaginatedResult<MaintenanceListDto>> GetAllInvoiceAsync(MaintenanceParams @params)
        {
            var query = _unitOfWork.Maintenances.Query()
                .Include(m => m.Vehicle)
                .Include(m => m.MaintenanceServices)
                    .ThenInclude(ms => ms.Service)
                .AsNoTracking();

            // Lọc theo Keyword (mã hóa đơn hoặc tên KTV)
            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.ToLower();
                query = query.Where(m => 
                    m.MaintenanceID.ToString().Contains(@params.Keyword) ||
                    (m.TechnicianName != null && m.TechnicianName.ToLower().Contains(keyword))
                );
            }

            // Lọc theo MaintenanceStatus
            if (!string.IsNullOrEmpty(@params.MaintenanceStatus))
            {
                query = query.Where(e => e.MaintenanceStatus == @params.MaintenanceStatus);
            }

            // Lọc theo MaintenanceType
            if (!string.IsNullOrEmpty(@params.MaintenanceType))
            {
                query = query.Where(e => e.MaintenanceType == @params.MaintenanceType);
            }

            // Lọc theo ngày
            if (@params.Day.HasValue && @params.Day.Value > 0)
            {
                query = query.Where(m => m.ScheduledDate.Day == @params.Day.Value);
            }

            // Lọc theo tháng
            if (@params.Month.HasValue && @params.Month.Value > 0)
            {
                query = query.Where(m => m.ScheduledDate.Month == @params.Month.Value);
            }

            // Lọc theo năm
            if (@params.Year.HasValue && @params.Year.Value > 0)
            {
                query = query.Where(m => m.ScheduledDate.Year == @params.Year.Value);
            }

            // Lọc theo tổng tiền tối thiểu
            if (@params.MinAmount.HasValue && @params.MinAmount.Value > 0)
            {
                query = query.Where(m => m.TotalCost >= (double)@params.MinAmount.Value);
            }

            // Lọc theo tổng tiền tối đa
            if (@params.MaxAmount.HasValue && @params.MaxAmount.Value > 0)
            {
                query = query.Where(m => m.TotalCost <= (double)@params.MaxAmount.Value);
            }

            // 1. Xử lý Dynamic Sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "maintenancestatus" => @params.IsDescending ? query.OrderByDescending(e => e.MaintenanceStatus) : query.OrderBy(e => e.MaintenanceStatus),
                    "totalcost" => @params.IsDescending ? query.OrderByDescending(e => e.TotalCost) : query.OrderBy(e => e.TotalCost),
                    "date" => @params.IsDescending ? query.OrderByDescending(e => e.ScheduledDate) : query.OrderBy(e => e.ScheduledDate),
                    // Mặc định sort theo ReportedAt như code cũ của bạn
                    _ => @params.IsDescending ? query.OrderByDescending(e => e.MaintenanceType) : query.OrderBy(e => e.MaintenanceType)
                };
            }
            var dtoQuery = query.Select(m => new MaintenanceListDto
            {
                Id = m.MaintenanceID.ToString(),
                // EF Core hỗ trợ string interpolation trong Select để dịch sang SQL
                InvoiceNumber = "HD-BT-" + m.MaintenanceID.ToString().PadLeft(4, '0'),
                VehicleId = m.VehicleID.ToString(),
                PlateNumber = m.Vehicle != null ? m.Vehicle.LicensePlate : "N/A",
                Date = m.ScheduledDate,
                Type = m.MaintenanceType,
                Workshop = m.GarageName,
                Technician = m.TechnicianName,
                TotalAmount = m.TotalCost,
                Notes = m.Notes,
                Status = m.MaintenanceStatus ?? "Unknown",
                // Map List con (Nested Collection)
                Services = m.MaintenanceServices.Select(ms => new MaintenanceServiceItemDto
                {
                    ServiceName = ms.Service.ServiceName,
                    Quantity = ms.Quantity,
                    Price = ms.UnitPrice,
                    Total = ms.TotalPrice
                }).ToList()
            });

            // 4. Gọi hàm paginate thần thánh của bạn
            // Kết quả trả về sẽ bao gồm total, limit, page và list objects
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<int> CreateMaintenanceAsync(CreateMaintenanceDto dto)
        {
            if (dto.Services == null || !dto.Services.Any())
                throw new Exception("Maintenance must have at least one service");

            var maintenance = new Maintenance
            {
                VehicleID = dto.VehicleID,
                MaintenanceType = dto.MaintenanceType,
                ScheduledDate = dto.ScheduledDate,
                GarageName = dto.GarageName,
                TechnicianName = dto.TechnicianName,
                Notes = dto.Notes,
                NextMaintenanceDate = dto.NextMaintenanceDate,
                NextMaintenanceKm = dto.NextMaintenanceKm,
                MaintenanceStatus = dto.MaintenanceStatus ?? "scheduled",
                MaintenanceServices = new List<FMS.Models.MaintenanceService>()
            };

            double totalCost = 0;

            foreach (var s in dto.Services)
            {
                var service = await _unitOfWork.Services
                    .GetByIdAsync(s.ServiceID);

                if (service == null)
                    throw new Exception($"Service {s.ServiceID} not found");

                var quantity = s.Quantity <= 0 ? 1 : s.Quantity;

                var unitPrice = s.UnitPrice ?? service.ServicePrice;

                var maintenanceService = new FMS.Models.MaintenanceService
                {
                    ServiceID = service.ServiceID,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = unitPrice * quantity
                };

                totalCost += maintenanceService.TotalPrice;
                maintenance.MaintenanceServices.Add(maintenanceService);
            }

            maintenance.TotalCost = totalCost;

            await _unitOfWork.Maintenances.AddAsync(maintenance);
            await _unitOfWork.SaveChangesAsync();

            return maintenance.MaintenanceID;
        }

        public async Task<MaintenanceStatsDto> GetMaintenanceStatsAsync()
        {
            var maintenances = await _unitOfWork.Maintenances.Query()
                .Include(m => m.MaintenanceServices)
                    .ThenInclude(ms => ms.Service)
                .AsNoTracking()
                .ToListAsync();

            var services = await _unitOfWork.Services.Query()
                .AsNoTracking()
                .ToListAsync();

            var totalInvoices = maintenances.Count;
            var totalCost = maintenances.Sum(m => m.TotalCost);
            var availableServices = services.Count;
            var completedInvoices = maintenances.Count(m => m.MaintenanceStatus == "completed");

            // Calculate service usage statistics
            var allServiceUsages = maintenances.SelectMany(m => m.MaintenanceServices).ToList();
            var totalServiceUsages = allServiceUsages.Count; // Tổng số lần sử dụng dịch vụ

            var serviceUsage = allServiceUsages
                .GroupBy(ms => ms.Service.ServiceName)
                .Select(g => new ServiceStatsDto
                {
                    ServiceName = g.Key,
                    Count = g.Count(),
                    Percentage = totalServiceUsages > 0 ? Math.Round((double)g.Count() / totalServiceUsages * 100, 1) : 0
                })
                .OrderByDescending(s => s.Count)
                .ToList();

            return new MaintenanceStatsDto
            {
                TotalInvoices = totalInvoices,
                TotalCost = totalCost.ToString("N0") + "đ",
                AvailableServices = availableServices,
                CompletedInvoices = completedInvoices,
                ServiceStats = serviceUsage
            };
        }

        public async Task<MaintenanceDetailDto> GetMaintenanceByIdAsync(int id)
        {
            var maintenance = await _unitOfWork.Maintenances.Query()
                .Include(m => m.Vehicle)
                .Include(m => m.MaintenanceServices)
                    .ThenInclude(ms => ms.Service)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MaintenanceID == id);

            if (maintenance == null)
                throw new Exception("Maintenance not found");

            return new MaintenanceDetailDto
            {
                Id = maintenance.MaintenanceID,
                InvoiceNumber = $"HD-BT-{maintenance.MaintenanceID.ToString().PadLeft(4, '0')}",
                Status = maintenance.MaintenanceStatus ?? "scheduled",

                PlateNumber = maintenance.Vehicle?.LicensePlate,
                Vehicle = maintenance.Vehicle != null
                    ? maintenance.Vehicle.LicensePlate
                    : "N/A",

                Type = maintenance.MaintenanceType,
                Technician = maintenance.TechnicianName,

                ScheduledDate = maintenance.ScheduledDate,
                Date = maintenance.MaintenanceStatus == "completed"
                    ? maintenance.ScheduledDate
                    : null,

                Description = maintenance.Notes,
                TotalAmount = maintenance.TotalCost,

                Services = maintenance.MaintenanceServices.Select(ms => new MaintenanceServiceDetailDto
                {
                    Name = ms.Service.ServiceName,
                    Price = ms.TotalPrice
                }).ToList()
            };
        }
    }
}
