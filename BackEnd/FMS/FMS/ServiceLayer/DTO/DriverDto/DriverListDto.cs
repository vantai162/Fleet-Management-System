namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class DriverListDto
    {
        public int DriverID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;

        public List<string> Licenses { get; set; } = new();
        public int? ExperienceYears { get; set; }
        public string AssignedVehicle { get; set; } = "Chưa gán";

        public int TotalTrips { get; set; }
        public double? Rating { get; set; }

        public string Status { get; set; } = "Active";
    }
}
