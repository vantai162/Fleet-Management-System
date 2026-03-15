using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.ComponentModel.DataAnnotations;

namespace FMS.Models
{
    public class User
    {
        [Key] public int UserID { get; set; }
        [StringLength(200)] public string? Email { get; set; }
        [Required, StringLength(200)] public string FullName { get; set; }
        [StringLength(20)] public string Phone { get; set; }
        public DateTime RegisteredAt { get; set; }
        [StringLength(200)] public string? PasswordHash { get; set; }
        [StringLength(100)] public string? BirthPlace { get; set; }
        public DateTime? BirthDate { get; set; }

        public DateTime? LastLoginAt { get; set; }

        // Role (Giới hạn 20 ký tự như trong SQL)
        [StringLength(20)] public string? Role { get; set; }
        public string? Department { get; set; }
        
        public string? Avatar { get; set; }
        public bool IsReceivingEmailNofication { get; set; } = false;
        public bool IsReceivingMaintainNofication { get; set; } = false;
        public bool IsReceivingGeoNofication { get; set; } = false;
        public bool IsReceivingReportNofication { get; set; } = false;

        // Navigation
        public Driver? Driver { get; set; }
    }
}
