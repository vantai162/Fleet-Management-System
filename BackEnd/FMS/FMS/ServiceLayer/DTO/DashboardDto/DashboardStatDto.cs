namespace FMS.ServiceLayer.DTO.DashboardDto
{
    public class DashboardStatDto
    {
        public List<TopCardDto> TopCards { get; set; }
        public StatusBlockDto VehicleStatus { get; set; }
        public StatusBlockDto DriverStatus { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; }
        public List<MonthlyStatDto> MonthlyStats { get; set; }
        public List<CapabilityDto> CapabilityByType { get; set; }
    }

}
