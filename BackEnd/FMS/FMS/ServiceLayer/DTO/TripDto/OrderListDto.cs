namespace FMS.ServiceLayer.DTO.TripDto
{
    public class OrderListDto
    {
        public int Id { get; set; }                 // TripID
        public string? Customer { get; set; }
        public string? Contact { get; set; }

        public string Pickup { get; set; }

        public string Dropoff { get; set; }

        public string Vehicle { get; set; }         // LicensePlate
        public string Driver { get; set; }          // Driver name

        public string Status { get; set; }          // waiting | in_transit | delivered

        public List<TripStepDto> Steps { get; set; }

        public double? FuelCost { get; set; }         // "200,000đ"
        public decimal? TollCost { get; set; }         // "100,000đ"

        public string Cost { get; set; }             // "800,000đ"

        public string? RouteGeometryJson { get; set; } // GeoJSON format
    }
}
