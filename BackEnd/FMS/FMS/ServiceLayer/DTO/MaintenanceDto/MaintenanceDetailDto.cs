namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class MaintenanceDetailDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; }
        public string Status { get; set; }

        public string PlateNumber { get; set; }
        public string Vehicle { get; set; }

        public string Type { get; set; }
        public string Technician { get; set; }

        public DateTime ScheduledDate { get; set; }
        public DateTime? Date { get; set; }

        public string Description { get; set; }

        public double TotalAmount { get; set; }

        public List<MaintenanceServiceDetailDto> Services { get; set; }
    }

}
