namespace FMS.ServiceLayer.DTO.TripDto
{
    public class TripChargeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }        // Xăng, Phí cầu đường...
        //public string Amount { get; set; }      // "200,000đ"
        public decimal AmountNumber { get; set; } // 200000
    }
}
