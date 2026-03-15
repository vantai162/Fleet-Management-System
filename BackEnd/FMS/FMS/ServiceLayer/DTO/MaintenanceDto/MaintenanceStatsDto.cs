namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class MaintenanceStatsDto
    {
        public int TotalInvoices { get; set; }
        public string TotalCost { get; set; }
        public int AvailableServices { get; set; }
        public int CompletedInvoices { get; set; }
        public List<ServiceStatsDto> ServiceStats { get; set; } = new List<ServiceStatsDto>();
    }

    public class ServiceStatsDto
    {
        public string ServiceName { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}