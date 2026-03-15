namespace FMS.ServiceLayer.DTO.DashboardDto
{
    public class CapabilityDto
    {
        public string Key { get; set; }
        public string Title { get; set; }
        public string RequiredLicenses { get; set; }
        public int NumVehicles { get; set; }
        public int DriversWithLicense { get; set; }
        public int DriversReady { get; set; }
    }
}
