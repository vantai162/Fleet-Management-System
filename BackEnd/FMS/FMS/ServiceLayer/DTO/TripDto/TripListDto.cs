namespace FMS.ServiceLayer.DTO.TripDto
{
    public class TripListDto
    {
        public int Id { get; set; }                 // trip.id
        public string Vehicle { get; set; }         // biển số
        public string Driver { get; set; }          // tên tài xế chính
        public string Route { get; set; }           // "A - B"

        public string Date { get; set; }            // dd/MM/yyyy
        public string? Time { get; set; }           // HH:mm - HH:mm

        public string Distance { get; set; }        // "120 km"
        public string Cost { get; set; }            // "1,200,000đ"

        public string Status { get; set; }          // completed | in-progress
        public bool Multiday { get; set; }

        public List<TripChargeDto> Charges { get; set; } = new();
    }
}
