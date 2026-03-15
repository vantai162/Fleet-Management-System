namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class MaintenanceServiceItemDto
    {
        public string ServiceName { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; } // UnitPrice
        public double Total { get; set; } // TotalPrice
    }
}
