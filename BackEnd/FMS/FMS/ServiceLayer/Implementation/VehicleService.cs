using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.VehicleDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FMS.ServiceLayer.Implementation
{
    public class VehicleService : IVehicleService
    {
        private readonly IUnitOfWork _unitOfWork;
        public VehicleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public int SuggestLicenseClass(string vehicleType, string capacity)
        {
            vehicleType = vehicleType?.Trim().ToLowerInvariant() ?? "";
            capacity = capacity?.Trim().ToLowerInvariant() ?? "";
            // Parse capacity
            int ton = 0, seats = 0;
            if (capacity.Contains("tấn"))
            {
                var match = Regex.Match(capacity, @"(\d+)");
                if (match.Success)
                    ton = int.Parse(match.Groups[1].Value);
            }
            else if (capacity.Contains("chỗ"))
            {
                var match = Regex.Match(capacity, @"(\d+)");
                if (match.Success)
                    seats = int.Parse(match.Groups[1].Value);
            }
            System.Console.WriteLine(ton);System.Console.WriteLine(seats);
            System.Console.WriteLine(vehicleType);

            // Mapping rules
            if (vehicleType.Contains("container"))
                return 15; // CE
            if (vehicleType.Contains("xe tải lớn") && ton > 7.5)
                return 9; // C
            if (vehicleType.Contains("xe tải nhỏ") && ton >= 3.5 && ton <= 7.5)
                return 8; // C1
            if (vehicleType.Contains("xe con") || vehicleType.Contains("bán tải"))
                return 7; // B
         
            
            
            if (vehicleType.Contains("xe khách"))
            {
                if (seats <= 16)
                    return 10; // D1
                if (seats <= 29)
                    return 11; // D2
                if (seats >= 30)
                    return 12; // D
            }
            // Default fallback
            return 7; // B
        }

        public async Task<PaginatedResult<VehicleListDto>> GetVehiclesAsync(VehicleParams @params)
        {
            // Khởi tạo query từ UnitOfWork
            var query = _unitOfWork.Vehicles.Query().AsNoTracking();

            // --- BƯỚC 1: LỌC (FILTERING) ---
            if (!string.IsNullOrEmpty(@params.VehicleType))
            {
                query = query.Where(v => v.VehicleType == @params.VehicleType);
            }

            if (!string.IsNullOrEmpty(@params.FuelType))
            {
                query = query.Where(v => v.FuelType == @params.FuelType);
            }

            if (!string.IsNullOrEmpty(@params.VehicleBrand))
            {
                query = query.Where(v => v.VehicleBrand == @params.VehicleBrand);
            }

            if (!string.IsNullOrEmpty(@params.VehicleStatus))
            {
                query = query.Where(v => v.VehicleStatus == @params.VehicleStatus);
            }

            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.Trim().ToLowerInvariant();
                query = query.Where(v => v.LicensePlate.ToLower().Contains(keyword));
            }

            // --- BƯỚC 2: SẮP XẾP (SORTING) ---
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "licenseplate" => @params.IsDescending ? query.OrderByDescending(v => v.LicensePlate) : query.OrderBy(v => v.LicensePlate),
                    "brand" => @params.IsDescending ? query.OrderByDescending(v => v.VehicleBrand) : query.OrderBy(v => v.VehicleBrand),
                    "km" => @params.IsDescending ? query.OrderByDescending(v => v.CurrentKm) : query.OrderBy(v => v.CurrentKm),
                    "year" => @params.IsDescending ? query.OrderByDescending(v => v.ManufacturedYear) : query.OrderBy(v => v.ManufacturedYear),
                    // Mặc định sắp xếp theo LicensePlate như params của bạn
                    _ => @params.IsDescending ? query.OrderByDescending(v => v.LicensePlate) : query.OrderBy(v => v.LicensePlate)
                };
            }

            // --- BƯỚC 3: MAPPING SANG DTO ---
            // Lưu ý: Không cần .Include() vì .Select() sẽ tự động JOIN các bảng liên quan
            var dtoQuery = query.Select(v => new VehicleListDto
            {
                VehicleID = v.VehicleID,
                LicensePlate = v.LicensePlate,
                VehicleType = v.VehicleType,
                VehicleModel = v.VehicleModel,
                VehicleBrand = v.VehicleBrand,
                FuelType = v.FuelType,
                CurrentKm = v.CurrentKm,
                VehicleStatus = v.VehicleStatus,
                ManufacturedYear = v.ManufacturedYear,

                RequiredLicenseClassID = v.RequiredLicenseClassID,
                RequiredLicenseCode = v.RequiredLicenseClass.Code,
                RequiredLicenseName = v.RequiredLicenseClass.LicenseDescription
            });

            // --- BƯỚC 4: PHÂN TRANG ---
            // Vì logic 'paginate' của bạn dùng: skip = page * limit
            // Nếu @params.PageNumber của bạn bắt đầu từ 1, hãy truyền (@params.PageNumber - 1)
            // Nếu bạn muốn dùng 0 là trang đầu tiên thì giữ nguyên @params.PageNumber
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<VehicleDetailDto?> GetVehicleDetailsAsync(int vehicleId)
        {
            var directTrips = await _unitOfWork.Trips.Query() // Giả sử bạn có repository Trips
            .Where(t => t.VehicleID == vehicleId)
            .ToListAsync();

            Console.WriteLine($"Số lượng chuyến đi tìm thấy trực tiếp: {directTrips.Count}");
            var vehicle = await _unitOfWork.Vehicles.Query()
                .Include(v => v.Driver)
                .Include(v => v.Trips)
                    .ThenInclude(t => t.TripDrivers)
                    .ThenInclude(t => t.Driver) // Để lấy tên tài xế cho từng chuyến đi
                    .ThenInclude(d => d.User)
                .Include(v => v.Maintenances)
                .Include(v => v.RequiredLicenseClass)
                .FirstOrDefaultAsync(v => v.VehicleID == vehicleId);

            if (vehicle == null) return null;

            return new VehicleDetailDto
            {
                Id = vehicle.VehicleID.ToString(),
                PlateNumber = vehicle.LicensePlate,
                Model = vehicle.VehicleModel ?? "N/A",
                Brand = vehicle.VehicleBrand ?? "N/A",
                Status = vehicle.VehicleStatus ?? "Sẵn sàng",
                Type = vehicle.VehicleType ?? "N/A",
                Year = vehicle.ManufacturedYear ?? 0,
                Mileage = vehicle.CurrentKm,
                Capacity = vehicle.Capacity ?? "N/A",
                FuelType = vehicle.FuelType ?? "N/A",
                RequiredLicense = vehicle.RequiredLicenseClass?.Code ?? "N/A",

                AssignedDriverId = vehicle.DriverID?.ToString(),
                AssignedDriverName = vehicle.Driver?.User.FullName,

                // Map Lịch sử chuyến đi
                Trips = vehicle.Trips?.Select(t => new VehicleTripDto
                {
                    Id = t.TripID,
                    StartLocation = t.StartLocation,
                    EndLocation = t.EndLocation,
                    Status = t.TripStatus, // Hoàn thành, Đang thực hiện...
                    StartDate = t.StartTime,
                    Distance = t.TotalDistanceKm,
                    DriverName = t.TripDrivers
                            .Select(td => td.Driver?.User.FullName) // Chọn ra danh sách các FullName
                            .FirstOrDefault() ?? "N/A"         // Lấy cái đầu tiên, nếu không có thì trả về N/A
                }).ToList() ?? new(),

                // Map Lịch sử bảo trì
                Maintenances = vehicle.Maintenances?.Select(m => new VehicleMaintenanceDto
                {
                    Id = m.MaintenanceID,
                    Type = "Bảo trì", // Hoặc map dựa trên logic của bạn
                    Description = $"Bảo trì tại {m.GarageName}",
                    Status = m.MaintenanceStatus ?? "Hoàn thành",
                    Date = m.FinishedDate ?? m.ScheduledDate,
                    Cost = m.TotalCost,
                    Notes = m.GarageName
                }).ToList() ?? new()
            };
        }

        public async Task<Vehicle> CreateVehicleAsync(VehicleCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var normalizedPlate = dto.LicensePlate.Trim().ToUpperInvariant();

                var vehicle = new Vehicle
                {
                    LicensePlate = normalizedPlate,
                    VehicleType = dto.VehicleType.Trim(),
                    VehicleBrand = dto.VehicleBrand.Trim(),
                    VehicleModel = dto.VehicleModel.Trim(),
                    ManufacturedYear = dto.ManufacturedYear,
                    Capacity = dto.Capacity.Trim(),
                    CurrentKm = dto.CurrentKm,
                    FuelType = dto.FuelType,
                    VehicleStatus = "available",
                    RequiredLicenseClassID = SuggestLicenseClass(dto.VehicleType, dto.Capacity)
                };

                await _unitOfWork.Vehicles.AddAsync(vehicle);
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                return vehicle;
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException("Biển số xe đã tồn tại.", ex);
            }
        }


        public async Task<bool> UpdateVehicleAsync(int vehicleId, VehicleUpdateDto dto)
        {
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(vehicleId);
            if (vehicle == null) return false;

            if (!string.IsNullOrEmpty(dto.LicensePlate))
                vehicle.LicensePlate = dto.LicensePlate.Trim().ToUpperInvariant();
            if (!string.IsNullOrEmpty(dto.VehicleType))
                vehicle.VehicleType = dto.VehicleType.Trim();
            if (!string.IsNullOrEmpty(dto.VehicleBrand))
                vehicle.VehicleBrand = dto.VehicleBrand.Trim();
            if (!string.IsNullOrEmpty(dto.VehicleModel))
                vehicle.VehicleModel = dto.VehicleModel.Trim();
            if (dto.ManufacturedYear.HasValue)
                vehicle.ManufacturedYear = dto.ManufacturedYear.Value;
            if (!string.IsNullOrEmpty(dto.Capacity))
                vehicle.Capacity = dto.Capacity.Trim();
            if (dto.CurrentKm.HasValue)
                vehicle.CurrentKm = dto.CurrentKm.Value;
            if (!string.IsNullOrEmpty(dto.FuelType))
                vehicle.FuelType = dto.FuelType;
            if (!string.IsNullOrEmpty(dto.VehicleStatus))
                vehicle.VehicleStatus = dto.VehicleStatus;
            if (dto.DriverID.HasValue)
                vehicle.DriverID = dto.DriverID.Value;

            _unitOfWork.Vehicles.Update(vehicle);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteVehicleAsync(int vehicleId)
        {
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(vehicleId);
            if (vehicle == null) return false;

            _unitOfWork.Vehicles.Remove(vehicle);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
