using System;

namespace FMS.ServiceLayer.DTO.ExtraExpenseDto
{
    public class ExtraExpenseListDto
    {
        public int Id { get; set; }
        public int TripId { get; set; }
        public string ExpenseType { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
    }
}


