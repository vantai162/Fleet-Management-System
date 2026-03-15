using System;
using System.ComponentModel.DataAnnotations;

namespace FMS.ServiceLayer.DTO.ExtraExpenseDto
{
    public class CreateExtraExpenseDto
    {
        [Required]
        public int TripId { get; set; }

        [Required, StringLength(50)]
        public string ExpenseType { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public DateTime? ExpenseDate { get; set; }

        public string? Location { get; set; }

        public string? Description { get; set; }
    }
}


