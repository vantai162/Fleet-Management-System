namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class DriverLicenseDto
    {
        public int LicenseClassID { get; set; }
        public string LicenseClassName { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
