namespace FMS.ServiceLayer.DTO.TripDto
{
    public class TripStepDto
    {
        public string Key { get; set; }        // gps | phone | delivered
        public string Label { get; set; }
        public bool Done { get; set; }
        public string? Time { get; set; }      // format sẵn cho FE
    }

}
