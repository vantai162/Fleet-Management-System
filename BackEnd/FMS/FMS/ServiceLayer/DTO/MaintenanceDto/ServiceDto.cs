namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class ServiceDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Category { get; set; } // Map từ ServiceType
    }
}
