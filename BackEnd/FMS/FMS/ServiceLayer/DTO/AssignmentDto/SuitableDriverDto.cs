namespace FMS.ServiceLayer.DTO.AssignmentDto
{
    public class SuitableDriverDto
    {
        public int DriverId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Licenses { get; set; } = string.Empty;
    }
}
