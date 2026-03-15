namespace FMS.ServiceLayer.DTO.EmergencyReportDto
{
    public class RespondEmergencyReportDto
    {
        public int EmergencyID { get; set; }
        public int RespondedByUserID { get; set; } // admin / dispatcher
    }
}
