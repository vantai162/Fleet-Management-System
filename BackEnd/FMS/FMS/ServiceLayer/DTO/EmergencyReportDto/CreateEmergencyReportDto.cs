namespace FMS.ServiceLayer.DTO.EmergencyReportDto
{
    public class CreateEmergencyReportDto
    {
        // ===== LIÊN KẾT (OPTIONAL) =====
        public int? TripID { get; set; }
        public int? VehicleID { get; set; }
        public int? DriverID { get; set; }

        // ===== THÔNG TIN SỰ CỐ =====
        public string Title { get; set; }        // Hỏng xe, Tai nạn...
        public string Description { get; set; }  // desc
        public string Level { get; set; }         // high | critical

        // ===== VỊ TRÍ =====
        public string Location { get; set; }

        // ===== LIÊN HỆ =====
        public string ContactPhone { get; set; }
    }
}
