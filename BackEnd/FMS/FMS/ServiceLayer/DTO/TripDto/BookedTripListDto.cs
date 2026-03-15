namespace FMS.ServiceLayer.DTO.TripDto
{
    public class BookedTripListDto
    {
        public int TripID { get; set; }

        // Customer
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }

        // Route
        public string PickupLocation { get; set; }
        public string DropoffLocation { get; set; }

        // Schedule
        public DateTime ScheduledDate { get; set; }
        public string ScheduledTime { get; set; }

        // Request
        public string? RequestedVehicleType { get; set; }
        public int? Passengers { get; set; }
        public string? RequestedCargo { get; set; }

        // Assignment
        public int? AssignedVehicleId { get; set; }
        public string? AssignedVehiclePlate { get; set; }

        public int? AssignedDriverId { get; set; }
        public string? AssignedDriverName { get; set; }

        public string Status { get; set; }

        public int? EstimatedDistanceKm { get; set; }
    }
}
