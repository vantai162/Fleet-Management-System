namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class DriverDetailsDto
    {
        public int DriverID { get; set; }

        public string FullName { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }
        public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? GPLX { get; set; }

        public int ExperienceYears { get; set; }

        public int TotalTrips { get; set; }
        public double? Rating { get; set; }
        public string DriverStatus { get; set; }

        public List<DriverLicenseDto> Licenses { get; set; }
    }
}
