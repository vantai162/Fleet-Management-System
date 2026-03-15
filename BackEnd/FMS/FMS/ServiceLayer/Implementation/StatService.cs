using FMS.DAL.Interfaces;
using FMS.ServiceLayer.DTO.DashboardDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;

namespace FMS.ServiceLayer.Implementation
{
    public class StatService: IStatService
    {
        private readonly IUnitOfWork _unitOfWork;
        public StatService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<DashboardStatDto> GetDashboardStatsAsync()
        {
            // 1️⃣ Top cards
            var totalVehicles = await _unitOfWork.Vehicles.Query().CountAsync();
            var totalDrivers = await _unitOfWork.Drivers.Query().CountAsync();
            var todayTrips = await _unitOfWork.Trips
                .Query()
                .CountAsync(t => t.StartTime.Date == DateTime.Today);

            var urgentReports = await _unitOfWork.EmergencyReports
                .Query()
                .CountAsync(r => r.Level == "critical");

            // 2️⃣ Vehicle status
            var vehicleStatus = await _unitOfWork.Vehicles
                .Query()
                .GroupBy(v => v.VehicleStatus)
                .Select(g => new StatusItemDto
                {
                    Label = g.Key,
                    Value = g.Count(),
                    //Color = MapVehicleStatusColor(g.Key)
                })
                .ToListAsync();

            // 3️⃣ Driver status
            var driverStatus = await _unitOfWork.Drivers
                .Query()
                .GroupBy(d => d.DriverStatus)
                .Select(g => new StatusItemDto
                {
                    Label = g.Key,
                    Value = g.Count(),
                    //Color = MapDriverStatusColor(g.Key)
                })
                .ToListAsync();

           
            // 5️⃣ Monthly stats
            var monthlyStats = await _unitOfWork.Trips
                .Query()
                .GroupBy(t => t.StartTime.Month)
                .Select(g => new MonthlyStatDto
                {
                    Month = $"T{g.Key}",
                    Distance = g.Sum(x => x.TotalDistanceKm),
                    Maintenance = _unitOfWork.Maintenances
                        .Query()
                        .Where(m => m.ScheduledDate.Month == g.Key)
                        .Sum(m => (decimal?)m.TotalCost) ?? 0
                })
                .ToListAsync();

            

            return new DashboardStatDto
            {
                TopCards = new List<TopCardDto>
                {
                    new() { Key="totalVehicles", Title="Tổng số xe", Value=totalVehicles },
                    new() { Key="totalDrivers", Title="Tổng tài xế", Value=totalDrivers },
                    new() { Key="todayTrips", Title="Chuyến đi hôm nay", Value=todayTrips },
                    new() { Key="urgentReports", Title="Báo cáo khẩn cấp", Value=urgentReports }
                },
                VehicleStatus = new StatusBlockDto
                {
                    Title = "Trạng thái phương tiện",
                    Items = vehicleStatus
                },
                DriverStatus = new StatusBlockDto
                {
                    Title = "Trạng thái tài xế",
                    Items = driverStatus
                },
                //RecentActivities = recentActivities,
                MonthlyStats = monthlyStats,
                //CapabilityByType = capability
            };
        }

        /*private string MapVehicleStatusColor(string status)
            => status switch
            {
                "ready" => "green",
                "in_use" => "blue",
                "maintenance" => "yellow",
                _ => "gray"
            };

        private string MapDriverStatusColor(string status)
            => status switch
            {
                "ready" => "green",
                "driving" => "blue",
                "leave" => "gray",
                _ => "gray"
            };
        */


        public async Task<List<TopCardDto>> GetTopCardsAsync()
        {
            var totalVehicles = await _unitOfWork.Vehicles.Query().CountAsync();
            var totalDrivers = await _unitOfWork.Drivers.Query().CountAsync();

            var readyVehicles = await _unitOfWork.Vehicles
                .Query()
                .CountAsync(v => v.VehicleStatus == "available");

            var readyDrivers = await _unitOfWork.Drivers
                .Query()
                .CountAsync(d => d.DriverStatus == "available");

            var todayTrips = await _unitOfWork.Trips
                .Query()
                .CountAsync(t => t.StartTime.Date == DateTime.Today);

            var completedTripsToday = await _unitOfWork.Trips
                .Query()
                .CountAsync(t =>
                    t.StartTime.Date == DateTime.Today &&
                    t.TripStatus == "completed");

            var urgentReports = await _unitOfWork.EmergencyReports
                .Query()
                .CountAsync(r => r.Level == "critical");

            var urgentToday = await _unitOfWork.EmergencyReports
                .Query()
                .CountAsync(r =>
                    r.Level == "criticalt" &&
                    r.ReportedAt.Date == DateTime.Today);

            return new List<TopCardDto>
            {
                new TopCardDto
                {
                    Key = "totalVehicles",
                    Title = "Tổng số xe",
                    Value = totalVehicles,
                    Footer = $"{readyVehicles} sẵn sàng"
                },
                new TopCardDto
                {
                    Key = "totalDrivers",
                    Title = "Tổng tài xế",
                    Value = totalDrivers,
                    Footer = $"{readyDrivers} sẵn sàng"
                },
                new TopCardDto
                {
                    Key = "todayTrips",
                    Title = "Chuyến đi hôm nay",
                    Value = todayTrips,
                    Footer = $"{completedTripsToday} hoàn thành"
                },
                new TopCardDto
                {
                    Key = "urgentReports",
                    Title = "Báo cáo khẩn cấp",
                    Value = urgentReports,
                    Footer = $"{urgentToday} khẩn cấp"
                }
            };
        }
    }
}
