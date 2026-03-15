namespace FMS.ServiceLayer.DTO.MaintenanceDto
{
    public class MaintenanceListDto
    {
        public string Id { get; set; } // Dùng string để linh hoạt hoặc int tùy bạn
        public string InvoiceNumber { get; set; } // Render từ "HD-" + MaintenanceID
        public string VehicleId { get; set; }
        public string PlateNumber { get; set; } // Lấy từ bảng Vehicle
        public DateTime Date { get; set; }
        public string Type { get; set; } // Bảo dưỡng định kỳ / Sửa chữa...
        public string Workshop { get; set; } // GarageName
        public string Technician { get; set; } // TechnicianName
        public double TotalAmount { get; set; } // TotalCost
        public string? Notes { get; set; }
        public string Status { get; set; }

        public List<MaintenanceServiceItemDto> Services { get; set; } = new();
    }
}
