using FMS.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class ExtraExpense
{
    [Key]
    public int ExtraExpenseID { get; set; }

    [ForeignKey(nameof(Trip))]
    public int TripID { get; set; }
    public Trip Trip { get; set; }

    [Required, StringLength(50)]
    public string ExpenseType { get; set; } // fuel | toll | ferry | parking | repair | fine | other

    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }

    public string? Location { get; set; }
    public string? Description { get; set; }
}
