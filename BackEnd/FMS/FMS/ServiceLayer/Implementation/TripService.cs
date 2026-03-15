using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.TripDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FMS.ServiceLayer.Implementation
{
    public class TripService : ITripService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TripService> _logger;
        public TripService(IUnitOfWork unitOfWork, ILogger<TripService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        public async Task<PaginatedResult<TripListDto>> GetTripsAsync(TripParams @params)
        {
            // 1. Khởi tạo query (Bỏ Include vì Select sẽ tự động JOIN)
            var query = _unitOfWork.Trips.Query().AsNoTracking();

            // --- BƯỚC 1: LỌC (FILTERING) ---
            // ALWAYS exclude "planned" trips (they are shown in Bookings page) - use case-insensitive check
            query = query.Where(t => t.TripStatus == null || t.TripStatus.ToLower() != "planned");

            if (!string.IsNullOrEmpty(@params.TripStatus))
            {
                var filterStatus = @params.TripStatus.ToLower();
                query = query.Where(t => t.TripStatus != null && t.TripStatus.ToLower() == filterStatus);
            }

            // If driver user id is provided, limit trips to those assigned to that driver (by UserID)
            if (@params.DriverUserId.HasValue)
            {
                var duid = @params.DriverUserId.Value;
                query = query.Where(t => t.TripDrivers.Any(td => td.Driver != null && td.Driver.User != null && td.Driver.User.UserID == duid));
            }

            // Keyword search: vehicle license plate or driver name
            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.Trim().ToLowerInvariant();
                query = query.Where(t => 
                    t.Vehicle.LicensePlate.ToLower().Contains(keyword) ||
                    t.TripDrivers.Any(td => td.Driver.User.FullName.ToLower().Contains(keyword))
                );
            }

            // Date filters
            if (@params.Day.HasValue)
            {
                query = query.Where(t => t.StartTime.Day == @params.Day.Value);
            }

            if (@params.Month.HasValue)
            {
                query = query.Where(t => t.StartTime.Month == @params.Month.Value);
            }

            if (@params.Year.HasValue)
            {
                query = query.Where(t => t.StartTime.Year == @params.Year.Value);
            }

            // --- BƯỚC 2: SẮP XẾP (SORTING) ---
            // Lưu ý: Sửa lại các case cho khớp với ToLower()
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "status" => @params.IsDescending ? query.OrderByDescending(t => t.TripStatus) : query.OrderBy(t => t.TripStatus),
                    "distance" => @params.IsDescending ? query.OrderByDescending(t => t.TotalDistanceKm) : query.OrderBy(t => t.TotalDistanceKm),
                    "starttime" => @params.IsDescending ? query.OrderByDescending(t => t.StartTime) : query.OrderBy(t => t.StartTime),
                    // Default sort theo StartTime nếu SortBy không khớp
                    _ => @params.IsDescending ? query.OrderByDescending(t => t.StartTime) : query.OrderBy(t => t.StartTime)
                };
            }
            else
            {
                query = query.OrderByDescending(t => t.StartTime);
            }

            // --- BƯỚC 3: MAPPING SANG DTO ---
            var dtoQuery = query.Select(t => new TripListDto
            {
                Id = t.TripID,
                Vehicle = t.Vehicle.LicensePlate,

                // Lấy tài xế chính
                Driver = t.TripDrivers
                    .Where(td => td.Role == "Main Driver")
                    .Select(td => td.Driver.User.FullName)
                    .FirstOrDefault() ?? "Chưa gán",

                Route = t.StartLocation + " - " + t.EndLocation,

                // Lưu ý: Một số bản EF Core cũ không dịch được .ToString("dd/MM/yyyy") sang SQL.
                // Nếu lỗi, hãy trả về DateTime thô và format ở Frontend.
                Date = t.StartTime.ToString("dd/MM/yyyy"),

                Time = t.EndTime != null

                ? $"{t.StartTime:HH:mm} - {t.EndTime:HH:mm}"

                : null,

                Distance = (t.TotalDistanceKm ?? 0) + " km",

                // Tính tổng chi phí (EF Core dịch Sum() sang SQL rất tốt)
                Cost = t.ExtraExpenses.Any()
                    ? t.ExtraExpenses.Sum(e => e.Amount).ToString() + "đ"
                    : "0đ",

                // Normalize TripStatus from DB into a small set of keys the frontend expects.
                Status = t.TripStatus == null ? "unknown" :
                          (t.TripStatus.ToLower() == "completed" ? "completed" :
                          (t.TripStatus.ToLower() == "confirmed" ? "confirmed" :
                          (t.TripStatus.ToLower() == "in progress" || t.TripStatus.ToLower() == "in_transit" || t.TripStatus.ToLower() == "in-transit" ? "in-progress" :
                          (t.TripStatus.ToLower() == "planned" ? "planned" :
                          t.TripStatus.ToLower())))),

                Multiday = t.EndTime != null && t.StartTime.Date != t.EndTime.Value.Date,

                Charges = t.ExtraExpenses.Select(e => new TripChargeDto
                {
                    Id = e.ExtraExpenseID,
                    Name = e.ExpenseType,
                    AmountNumber = e.Amount
                }).ToList()
            });

            // --- BƯỚC 4: PHÂN TRANG ---
            // Sử dụng logic skip = page * limit của bạn
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<TripStatsDto> GetTripStatsAsync()
        {
            var today = DateTime.Today;

            var query = _unitOfWork.Trips.Query();

            return new TripStatsDto
            {
                TodayTrips = await query.CountAsync(t => t.StartTime.Date == today),
                InProgress = await query.CountAsync(t => t.TripStatus != null && t.TripStatus.ToLower() == "in progress"),
                Completed = await query.CountAsync(t => t.TripStatus != null && t.TripStatus.ToLower() == "completed"),
                TotalDistance = string.Format("{0:N0} km",
                    await query.SumAsync(t => t.TotalDistanceKm ?? 0))
            };
        }

        public async Task<OrderListDto> GetOrdersByIdAsync(int tripId)
        {
            if (tripId <= 0)
                throw new ArgumentException("Trip id not found");
            var trip = await _unitOfWork.Trips.Query()
                                        .Include(t => t.Vehicle)
                                        .Include(t => t.TripDrivers)
                                            .ThenInclude(td => td.Driver)
                                                .ThenInclude(d => d.User)
                                        .Include(t => t.TripSteps)
                                        .Include(t => t.ExtraExpenses)
                                        .Include(t => t.FuelRecords)
                                        .FirstOrDefaultAsync(d => d.TripID == tripId);

            if (trip == null)
                throw new KeyNotFoundException("Trip not found");
            decimal fuelRecord = (decimal)trip.FuelRecords?.Sum(f => f.FuelCost);

            return new OrderListDto
            {
                Id = trip.TripID,
                Customer = trip.CustomerName,
                Contact = trip.CustomerPhone,
                Pickup = trip.StartLocation,
                Dropoff = trip.EndLocation,
                Vehicle = trip.Vehicle != null ? trip.Vehicle.LicensePlate : null,
                Driver = (trip.TripDrivers ?? Enumerable.Empty<TripDriver>())
                            .OrderByDescending(td => td.AssignedFrom)
                            .Select(td => td.Driver != null && td.Driver.User != null ? td.Driver.User.FullName : null)
                            .FirstOrDefault(),

                Status = trip.TripStatus,

                Steps = (trip.TripSteps ?? Enumerable.Empty<TripStep>())
                    .OrderBy(s => s.TripStepID)
                    .Select(s => new TripStepDto
                    {
                        Key = s.StepKey,
                        Label = s.StepLabel,
                        Done = s.IsDone,
                        Time = s.ConfirmedAt != null
                            ? s.ConfirmedAt.Value.ToString("HH:mm:ss dd/MM/yyyy")
                            : null
                    }).ToList(),

                TollCost = trip.ExtraExpenses?.Sum(e => e.Amount),
                FuelCost = trip.FuelRecords?.Sum(f => f.FuelCost),
                Cost = $"{((trip.ExtraExpenses?.Sum(e => e.Amount) ?? 0) + fuelRecord):N0}đ",
                RouteGeometryJson = trip.RouteGeometryJson
            };
         
        }

        public async Task<OrderListDto> ConfirmTripStepAsync(int tripId, string stepKey)
        {
            if (tripId <= 0) 
                _logger?.LogWarning("ConfirmTripStepAsync called with invalid tripId: {TripId}", tripId);
            if (string.IsNullOrEmpty(stepKey)) throw new ArgumentException("Step key required");

            var step = await _unitOfWork.TripSteps.Query()
                .FirstOrDefaultAsync(s => s.TripID == tripId && s.StepKey == stepKey);
            if (step == null) throw new KeyNotFoundException("Step not found");

            step.IsDone = true;
            step.ConfirmedAt = DateTime.Now;
            _unitOfWork.TripSteps.Update(step);
            await _unitOfWork.SaveChangesAsync();

            // Determine overall trip status:
            // - If confirming the first step (pickup) => set trip status to "in progress"
            // - If all steps done => set trip status to "completed"
            var allDone = await _unitOfWork.TripSteps.Query()
                .Where(s => s.TripID == tripId)
                .AllAsync(s => s.IsDone);

            var trip = await _unitOfWork.Trips.GetByIdAsync(tripId);
            if (trip != null)
            {
                if (allDone)
                {
                    if (!string.Equals(trip.TripStatus, "completed", StringComparison.OrdinalIgnoreCase))
                    {
                        trip.TripStatus = "completed";
                        trip.TotalDistanceKm = trip.EstimatedDistanceKm; // for simplicity
                        trip.EndTime = DateTime.Now;
                        trip.ActualDurationMin = trip.EstimatedDurationMin; // for simplicity
                        _unitOfWork.Trips.Update(trip);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }
                else
                {
                    // if not all done and this was the pickup confirmation, mark as in progress
                    if (string.Equals(step.StepKey, "pickup", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(trip.TripStatus, "in progress", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(trip.TripStatus, "completed", StringComparison.OrdinalIgnoreCase))
                    {
                        trip.TripStatus = "in progress";
                        _unitOfWork.Trips.Update(trip);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }
            }

            // return refreshed order list
            return await GetOrdersByIdAsync(tripId);
        }

        public async Task<PaginatedResult<BookedTripListDto>> GetBookedTripListAsync(BookedTripParams @params)
        {
            var query =  _unitOfWork.Trips.Query()
                .Where(t => t.ScheduledStartTime != null && t.TripStatus != null && t.TripStatus.ToLower() == "planned").AsNoTracking();

            // --- BƯỚC 1: LỌC (FILTERING) ---
            // Keyword search: customer name, phone, or email
            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var keyword = @params.Keyword.Trim().ToLowerInvariant();
                query = query.Where(t => 
                    t.CustomerName.ToLower().Contains(keyword) ||
                    t.CustomerPhone.ToLower().Contains(keyword) ||
                    (t.CustomerEmail != null && t.CustomerEmail.ToLower().Contains(keyword))
                );
            }

            // Date filters
            if (@params.Day.HasValue)
            {
                query = query.Where(t => t.ScheduledStartTime.Value.Day == @params.Day.Value);
            }

            if (@params.Month.HasValue)
            {
                query = query.Where(t => t.ScheduledStartTime.Value.Month == @params.Month.Value);
            }

            if (@params.Year.HasValue)
            {
                query = query.Where(t => t.ScheduledStartTime.Value.Year == @params.Year.Value);
            }

            // --- BƯỚC 2: SẮP XẾP (SORTING) ---
            // Lưu ý: Sửa lại các case cho khớp với ToLower()
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "starttime" => @params.IsDescending ? query.OrderByDescending(t => t.StartTime) : query.OrderBy(t => t.StartTime),
                    // Default sort theo StartTime nếu SortBy không khớp
                    _ => @params.IsDescending ? query.OrderByDescending(t => t.StartTime) : query.OrderBy(t => t.StartTime)
                };
            }

            var dtoQuery = query.Select(t => new BookedTripListDto
                {
                    TripID = t.TripID,
                    // Customer
                    CustomerName = t.CustomerName,
                    CustomerPhone = t.CustomerPhone,
                    CustomerEmail = t.CustomerEmail,
                    // Route
                    PickupLocation = t.StartLocation,
                    DropoffLocation = t.EndLocation,
                    // Schedule
                    ScheduledDate = t.ScheduledStartTime.Value.Date,
                    ScheduledTime = t.ScheduledStartTime.Value.ToString("HH:mm"),
                    // Request
                    RequestedVehicleType = t.RequestedVehicleType,
                    Passengers = t.RequestedPassengers,
                    RequestedCargo = t.RequestedCargo,
                    // Assignment
                    AssignedVehicleId = t.VehicleID,
                    AssignedVehiclePlate = t.Vehicle.LicensePlate,
                    AssignedDriverId = t.TripDrivers
                                        .Where(td => td.Role == "Main Driver")
                                        .Select(td => td.DriverID)
                                        .FirstOrDefault(),
                    AssignedDriverName = t.TripDrivers
                                        .Where(td => td.Role == "Main Driver")
                                        .Select(td => td.Driver.User.FullName)
                                        .FirstOrDefault(),
                    Status = t.TripStatus,
                    EstimatedDistanceKm = t.EstimatedDistanceKm
            });
            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<BookedTripStatsDto> GetBookedTripStatsAsync()
        {
            var trips = _unitOfWork.Trips.Query();
            return new BookedTripStatsDto
            {
                Planned = await trips.CountAsync(t => t.TripStatus == "Planned"),
                Confirmed = await trips.CountAsync(t => t.TripStatus == "Confirmed")
            };

        }

        public async Task<Trip> CreateBookingTripAsync(CreateBookingTripDto dto)
        {
            // helper to compute a deterministic distance estimate from start/end strings
            static int ComputeDistanceFromStrings(string start, string end)
            {
                var s = start ?? "";
                var e = end ?? "";
                int hashStart = 0;
                foreach (var c in s) hashStart += c;
                int hashEnd = 0;
                foreach (var c in e) hashEnd += c;
                return Math.Abs(hashStart - hashEnd) % 2000 + 50; // 50..2049 km
            }

            var estimatedDistance = dto.EstimatedDistanceKm;
            if (!estimatedDistance.HasValue)
            {
                estimatedDistance = ComputeDistanceFromStrings(dto.StartLocation, dto.EndLocation);
            }

            var estimatedDuration = dto.EstimatedDurationMin;
            if (!estimatedDuration.HasValue)
            {
                estimatedDuration = estimatedDistance ?? 0;
            }

            _logger?.LogDebug("Creating trip: Customer={Customer}, Start={Start}, End={End}, Scheduled={Scheduled}",
                dto.CustomerName, dto.StartLocation, dto.EndLocation, dto.ScheduledStartTime);

            var trip = new Trip
            {
                // CHƯA ASSIGN
                VehicleID = dto.VehicleID,

                // CUSTOMER
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,

                // ROUTE
                StartLocation = dto.StartLocation,
                EndLocation = dto.EndLocation,
                // Ensure RouteGeometryJson is always a string
                RouteGeometryJson = string.IsNullOrEmpty(dto.RouteGeometryJson) ? "string" : dto.RouteGeometryJson,

                // ESTIMATE
                EstimatedDistanceKm = estimatedDistance,
                EstimatedDurationMin = estimatedDuration,

                // BOOKING TIME
                ScheduledStartTime = dto.ScheduledStartTime,

                // REQUEST
                RequestedVehicleType = dto.RequestedVehicleType,
                RequestedPassengers = dto.RequestedPassengers,
                RequestedCargo = dto.RequestedCargo,

                // STATUS
                TripStatus = "planned",
                StartTime = dto.ScheduledStartTime,
                // Actual duration should always be null on creation
                ActualDurationMin = null
            };

            await _unitOfWork.Trips.AddAsync(trip);
            await _unitOfWork.SaveChangesAsync();
            _logger?.LogInformation("Created trip {TripID} with EstimatedDistanceKm={Distance} EstimatedDurationMin={Duration}",
                trip.TripID, trip.EstimatedDistanceKm, trip.EstimatedDurationMin);
            
            // Create default TripSteps for the new trip (IsDone = false)
            // Default steps: pickup -> on_way -> delivery
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
            await _unitOfWork.SaveChangesAsync();

            return trip;
        }

        public async Task<bool> CancelTripAsync(int tripId)
        {
            var trip = await _unitOfWork.Trips.GetByIdAsync(tripId);
            if (trip == null) return false;

            // Remove related TripSteps and ExtraExpenses explicitly if present to ensure full deletion
            var steps = _unitOfWork.TripSteps.Query().Where(s => s.TripID == tripId);
            _unitOfWork.TripSteps.RemoveRange(steps);

            var expenses = _unitOfWork.ExtraExpenses.Query().Where(e => e.TripID == tripId);
            _unitOfWork.ExtraExpenses.RemoveRange(expenses);

            _unitOfWork.Trips.Remove(trip);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        
        public async Task<bool> ConfirmBookedTripAsync(int tripId)
        {
            var trip = await _unitOfWork.Trips.GetByIdAsync(tripId);
            if (trip == null) return false;
            // Only allow confirming planned trips
            if (!string.Equals(trip.TripStatus, "planned", StringComparison.OrdinalIgnoreCase)) return false;

            trip.TripStatus = "confirmed";
            _unitOfWork.Trips.Update(trip);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Estimate and update trips in database: set ActualDurationMin = null,
        // RouteGeometryJson = "string", and fill EstimatedDistanceKm & EstimatedDurationMin if missing.
        public async Task<int> EstimateAndUpdateTripsAsync()
        {
            var trips = await _unitOfWork.Trips.Query().ToListAsync();
            var updatedCount = 0;

            foreach (var trip in trips)
            {
                var changed = false;

                // Ensure ActualDurationMin is always null
                if (trip.ActualDurationMin != null)
                {
                    trip.ActualDurationMin = null;
                    changed = true;
                }

                // Ensure RouteGeometryJson is a (non-null) string
                if (string.IsNullOrEmpty(trip.RouteGeometryJson))
                {
                    trip.RouteGeometryJson = "string";
                    changed = true;
                }

                // Estimate distance if missing
                if (!trip.EstimatedDistanceKm.HasValue)
                {
                    var start = trip.StartLocation ?? "";
                    var end = trip.EndLocation ?? "";
                    // deterministic simple hash-based estimate in km
                    int hashStart = 0;
                    foreach (var c in start) hashStart += c;
                    int hashEnd = 0;
                    foreach (var c in end) hashEnd += c;
                    var distance = Math.Abs(hashStart - hashEnd) % 2000 + 50; // 50..2049 km
                    trip.EstimatedDistanceKm = distance;
                    changed = true;
                }

                // Estimate duration minutes if missing: use distance (1 km ~= 1 minute at avg speed 60km/h)
                if (!trip.EstimatedDurationMin.HasValue)
                {
                    trip.EstimatedDurationMin = trip.EstimatedDistanceKm ?? 0;
                    changed = true;
                }

                if (changed)
                {
                    _unitOfWork.Trips.Update(trip);
                    updatedCount++;
                }
            }

            if (updatedCount > 0)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            return updatedCount;
        }
    }
}
