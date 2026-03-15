using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.ServiceLayer.DTO.FuelRecordDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using FMS.Pagination;
using System.Linq;

namespace FMS.ServiceLayer.Implementation
{
    public class FuelRecordService : IFuelRecordService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FuelRecordService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaginatedResult<FuelRecordListDto>> GetAllAsync(FuelRecordParams @params)
        {
            var query = _unitOfWork.FuelRecords.Query()
                .Include(fr => fr.Vehicle)
                .Include(fr => fr.Driver)
                    .ThenInclude(d => d.User)
                .AsNoTracking();

            // Filtering
            if (@params.TripID.HasValue)
            {
                query = query.Where(fr => fr.TripID == @params.TripID.Value);
            }
            if (@params.VehicleID.HasValue)
            {
                query = query.Where(fr => fr.VehicleID == @params.VehicleID.Value);
            }
            if (@params.DriverID.HasValue)
            {
                query = query.Where(fr => fr.DriverID == @params.DriverID.Value);
            }
            if (@params.FromFuelTime.HasValue)
            {
                query = query.Where(fr => fr.FuelTime >= @params.FromFuelTime.Value);
            }
            if (@params.ToFuelTime.HasValue)
            {
                query = query.Where(fr => fr.FuelTime <= @params.ToFuelTime.Value);
            }

            // Sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "fueltime" => @params.IsDescending ? query.OrderByDescending(fr => fr.FuelTime) : query.OrderBy(fr => fr.FuelTime),
                    "fuelamount" => @params.IsDescending ? query.OrderByDescending(fr => fr.FuelAmount) : query.OrderBy(fr => fr.FuelAmount),
                    "fuelcost" => @params.IsDescending ? query.OrderByDescending(fr => fr.FuelCost) : query.OrderBy(fr => fr.FuelCost),
                    _ => @params.IsDescending ? query.OrderByDescending(fr => fr.FuelTime) : query.OrderBy(fr => fr.FuelTime)
                };
            }
            else
            {
                query = query.OrderByDescending(fr => fr.FuelTime);
            }

            var dtoQuery = query.Select(fr => new FuelRecordListDto
            {
                FuelRecordID = fr.FuelRecordID,
                VehicleID = fr.VehicleID,
                DriverID = fr.DriverID,
                TripID = fr.TripID,
                FuelTime = fr.FuelTime,
                ReFuelLocation = fr.ReFuelLocation,
                FuelAmount = fr.FuelAmount,
                FuelCost = fr.FuelCost,
                CurrentKm = fr.CurrentKm,
                VehiclePlate = fr.Vehicle != null ? fr.Vehicle.LicensePlate : null,
                DriverName = fr.Driver != null && fr.Driver.User != null ? fr.Driver.User.FullName : null,
                Note = "" // DB has no note column; leave empty
            });

            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<IEnumerable<FuelRecordListDto>> GetByTripIdAsync(int tripId)
        {
            var query = _unitOfWork.FuelRecords.Query()
                .Where(fr => fr.TripID == tripId)
                .OrderByDescending(fr => fr.FuelTime)
                .AsNoTracking()
                .Select(fr => new FuelRecordListDto
                {
                    FuelRecordID = fr.FuelRecordID,
                    VehicleID = fr.VehicleID,
                    DriverID = fr.DriverID,
                    TripID = fr.TripID,
                    FuelTime = fr.FuelTime,
                    ReFuelLocation = fr.ReFuelLocation,
                    FuelAmount = fr.FuelAmount,
                    FuelCost = fr.FuelCost,
                    CurrentKm = fr.CurrentKm
                });

            return await query.ToListAsync();
        }

        public async Task<FuelRecordListDto> GetByIdAsync(int id)
        {
            var fr = await _unitOfWork.FuelRecords.Query()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.FuelRecordID == id);

            if (fr == null)
                throw new InvalidOperationException("Fuel record not found");

            return new FuelRecordListDto
            {
                FuelRecordID = fr.FuelRecordID,
                VehicleID = fr.VehicleID,
                DriverID = fr.DriverID,
                TripID = fr.TripID,
                FuelTime = fr.FuelTime,
                ReFuelLocation = fr.ReFuelLocation,
                FuelAmount = fr.FuelAmount,
                FuelCost = fr.FuelCost,
                CurrentKm = fr.CurrentKm,
                VehiclePlate = fr.Vehicle != null ? fr.Vehicle.LicensePlate : null,
                DriverName = fr.Driver != null && fr.Driver.User != null ? fr.Driver.User.FullName : null,
                Note = ""
            };
        }

        public async Task<FuelRecordListDto> CreateAsync(CreateFuelRecordDto dto)
        {
            // Basic validation
            var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(dto.VehicleID);
            if (vehicle == null) throw new InvalidOperationException("Vehicle not found");

            Driver? driver = null;
            if (dto.DriverID.HasValue)
            {
                driver = await _unitOfWork.Drivers.GetByIdAsync(dto.DriverID.Value);
                if (driver == null) throw new InvalidOperationException("Driver not found");
            }
            else if (vehicle.DriverID != 0)
            {
                // try to auto-bind driver from vehicle assignment
                driver = await _unitOfWork.Drivers.GetByIdAsync(vehicle.DriverID);
            }

            if (driver == null)
            {
                throw new InvalidOperationException("Driver is not assigned. Please provide DriverID or assign a driver to the vehicle.");
            }

            var fr = new FuelRecord
            {
                VehicleID = dto.VehicleID,
                DriverID = driver.DriverID,
                TripID = dto.TripID,
                FuelTime = dto.FuelTime,
                ReFuelLocation = dto.ReFuelLocation ?? string.Empty,
                FuelAmount = dto.FuelAmount,
                FuelCost = dto.FuelCost,
                CurrentKm = dto.CurrentKm ?? 0
            };

            await _unitOfWork.FuelRecords.AddAsync(fr);
            await _unitOfWork.SaveChangesAsync();

            return new FuelRecordListDto
            {
                FuelRecordID = fr.FuelRecordID,
                VehicleID = fr.VehicleID,
                DriverID = fr.DriverID,
                TripID = fr.TripID,
                FuelTime = fr.FuelTime,
                ReFuelLocation = fr.ReFuelLocation,
                FuelAmount = fr.FuelAmount,
                FuelCost = fr.FuelCost,
                CurrentKm = fr.CurrentKm,
                VehiclePlate = fr.Vehicle != null ? fr.Vehicle.LicensePlate : null,
                DriverName = fr.Driver != null && fr.Driver.User != null ? fr.Driver.User.FullName : null,
                Note = ""
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var fr = await _unitOfWork.FuelRecords.GetByIdAsync(id);
            if (fr == null) throw new InvalidOperationException("Fuel record not found");

            _unitOfWork.FuelRecords.Remove(fr);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}



