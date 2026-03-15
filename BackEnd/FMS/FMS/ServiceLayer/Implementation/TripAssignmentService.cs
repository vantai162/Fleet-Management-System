using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.ServiceLayer.DTO.AssignmentDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;

namespace FMS.ServiceLayer.Implementation
{
    public class TripAssignmentService : ITripAssignmentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TripAssignmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        public async Task<List<SuitableVehicleDto>> GetAvailableVehiclesForTripAsync()
        {
            

            // 2. Lấy danh sách VEHICLE phù hợp
            var vehicles = await _unitOfWork.Vehicles.Query()
                .Include(v => v.RequiredLicenseClass)
                .Where(v =>
                    v.VehicleStatus == "available"
                // && v.VehicleType == trip.RequestedVehicleType
                )
                //.OrderBy(v => v.CurrentKm) // optional
                .ToListAsync();

            return new List<SuitableVehicleDto>(vehicles.Select(v => new SuitableVehicleDto
            {
                VehicleId = v.VehicleID,
                LicensePlate = v.LicensePlate,
                Model = v.VehicleModel,
                Brand = v.VehicleBrand,
                Type = v.VehicleType
            }));
        }


        public async Task<List<SuitableDriverDto>> GetAvailableDriversForVehicleAsync(int vehicleId)
        {
            var vehicle = await _unitOfWork.Vehicles.Query()
                .Include(v => v.RequiredLicenseClass)
                .FirstOrDefaultAsync(v => v.VehicleID == vehicleId);

            if (vehicle == null)
                throw new Exception("Vehicle not found");

           return new List<SuitableDriverDto>(
                await _unitOfWork.Drivers.Query()
                    .Include(d => d.User)
                    .Include(d => d.DriverLicenses)
                        .ThenInclude(dl => dl.LicenseClass)
                    .Where(d =>
                        d.DriverStatus == "available" &&
                        d.DriverLicenses.Any(dl =>
                            dl.ExpiryDate > DateTime.Now &&
                            dl.LicenseClass.Rank >= vehicle.RequiredLicenseClass.Rank
                        )
                    )
                    //.OrderBy(d => d.TotalTrips) // optional
                    .Select(d => new SuitableDriverDto
                    {
                        DriverId = d.DriverID,
                        FullName = d.User.FullName,
                        Licenses = string.Join(", ",
                            d.DriverLicenses
                                .Where(dl => dl.ExpiryDate > DateTime.Now)
                                .Select(dl => dl.LicenseClass.Code))
                                })
                    .ToListAsync()
            );
        }
        public async Task<bool> AssignVehicleAndDriverAsync(int tripId,int vehicleId,int driverId)
        {
            var trip = await _unitOfWork.Trips.Query()
                .Include(t => t.TripDrivers)
                .FirstOrDefaultAsync(t => t.TripID == tripId);

            if (trip == null) throw new Exception("Trip not found");

            var vehicle = await _unitOfWork.Vehicles.Query()
                .Include(v => v.RequiredLicenseClass)
                .FirstOrDefaultAsync(v => v.VehicleID == vehicleId);

            var driver = await _unitOfWork.Drivers.Query()
                .Include(d => d.DriverLicenses)
                    .ThenInclude(dl => dl.LicenseClass)
                .FirstOrDefaultAsync(d => d.DriverID == driverId);

            // ===== VALIDATION =====
            if (vehicle.VehicleStatus != "available")
                throw new Exception("Vehicle not available");

            if (driver.DriverStatus != "available")
                throw new Exception("Driver not available");

            var validLicense = driver.DriverLicenses.Any(dl =>
                dl.ExpiryDate > DateTime.Now &&
                dl.LicenseClass.Rank >= vehicle.RequiredLicenseClass.Rank
            );

            if (!validLicense)
                throw new Exception("Driver license not suitable");

            // ===== ASSIGN =====
            trip.VehicleID = vehicle.VehicleID;
            trip.TripStatus = "confirmed";

            await _unitOfWork.TripDrivers.AddAsync(new TripDriver
            {
                TripID = trip.TripID,
                DriverID = driver.DriverID,
                Role = "Main Driver",
                AssignedFrom = DateTime.Now
            });

            vehicle.VehicleStatus = "in_use";
            driver.DriverStatus = "on_trip";

            // Create default TripSteps if they do not already exist for this trip
            var hasSteps = await _unitOfWork.TripSteps.Query().AnyAsync(s => s.TripID == trip.TripID);
            var createdSteps = false;
            if (!hasSteps)
            {
                var steps = new List<TripStep>
                {
                    new TripStep
                    {
                        TripID = trip.TripID,
                        StepKey = "pickup",
                        StepLabel = "Lấy hàng tại kho",
                        IsDone = false
                    },
                    new TripStep
                    {
                        TripID = trip.TripID,
                        StepKey = "on_way",
                        StepLabel = "Đang vận chuyển",
                        IsDone = false
                    },
                    new TripStep
                    {
                        TripID = trip.TripID,
                        StepKey = "delivery",
                        StepLabel = "Giao hàng cho khách",
                        IsDone = false
                    }
                };

                await _unitOfWork.TripSteps.AddRangeAsync(steps);
                createdSteps = true;
            }

            await _unitOfWork.SaveChangesAsync();
            return createdSteps;
        }


    }
}
