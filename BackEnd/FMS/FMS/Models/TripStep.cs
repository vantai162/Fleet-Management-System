using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class TripStep
    {
        [Key]
        public int TripStepID { get; set; }

        [ForeignKey(nameof(Trip))]
        public int TripID { get; set; }
        public Trip Trip { get; set; }

        [Required, StringLength(50)]
        public string StepKey { get; set; }
        // gps | phone | delivered

        [Required, StringLength(200)]
        public string StepLabel { get; set; }

        public bool IsDone { get; set; }
        public DateTime? ConfirmedAt { get; set; }
    }

}
