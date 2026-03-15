using FMS.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class TripLog
{
    [Key]
    public int TripLogID { get; set; }

    [ForeignKey(nameof(Trip))]
    public int TripID { get; set; }
    public Trip Trip { get; set; }

    public DateTime LogTime { get; set; }

    [StringLength(255)]
    public string Location { get; set; }

    public int DistanceFromLastKm { get; set; }
    public double FuelUsed { get; set; }

    [StringLength(50)]
    public string LogType { get; set; }
    // start | stop | checkpoint | refuel | rest
}
