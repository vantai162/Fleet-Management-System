using FMS.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class TripDriver
{
    [Key]
    public int TripDriverID { get; set; }

    [ForeignKey("Trip")]
    public int TripID { get; set; }

    [ForeignKey("Driver")]
    public int DriverID { get; set; }

    [StringLength(50)]
    public string Role { get; set; } // MainDriver, Assistant, Supervisor

    public DateTime AssignedFrom { get; set; }
    public DateTime? AssignedTo { get; set; }
    public double? TripRating { get; set; }

    public Trip Trip { get; set; }
    public Driver Driver { get; set; }
}
