namespace FMS.ServiceLayer.DTO.DriverDto
{
    public class CreateDriverLicenseDto
    {
        public int LicenseClassID { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}