namespace FMS.ServiceLayer.DTO.TripDto
{
    public class TripStatsDto
    {
        public int TodayTrips { get; set; }
        public int InProgress { get; set; }
        public int Completed { get; set; }
        public string TotalDistance { get; set; } // "1,250 km"
    }
}
