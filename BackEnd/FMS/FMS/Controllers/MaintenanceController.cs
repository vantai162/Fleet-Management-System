using FMS.Pagination;
using FMS.ServiceLayer.DTO.MaintenanceDto;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceController: ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;
        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }
        [HttpGet("services")]
        public async Task<IActionResult> GetAllServices()
        {
            var services = await _maintenanceService.GetAllServiceAsync();
            return Ok(services);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetMaintenanceStats()
        {
            var stats = await _maintenanceService.GetMaintenanceStatsAsync();
            return Ok(stats);
        }
        [HttpGet]
        public async Task<IActionResult> GetAllInvoices([FromQuery] MaintenanceParams @params)
        {
            var invoices = await _maintenanceService.GetAllInvoiceAsync(@params);
            return Ok(invoices);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetMaintenanceById([FromRoute] int id)
        {
            var maintenance = await _maintenanceService.GetMaintenanceByIdAsync(id);
            return Ok(maintenance);
        }

        [HttpPost]
        [EnableRateLimiting("fixed")]
        public async Task<IActionResult> CreateMaintenance([FromBody] CreateMaintenanceDto dto)
        {
            var maintenanceId = await _maintenanceService.CreateMaintenanceAsync(dto);
            return CreatedAtAction(nameof(GetAllInvoices), new { id = maintenanceId }, new { Id = maintenanceId });
        }

        // GET: api/maintenance/options/types
        [HttpGet("options/types")]
        public IActionResult GetMaintenanceTypes()
        {
            var types = new[]
            {
                new { value = "Bảo dưỡng định kỳ", label = "Bảo dưỡng định kỳ" },
                new { value = "Sửa chữa khẩn cấp", label = "Sửa chữa khẩn cấp" },
                new { value = "Thay thế linh kiện", label = "Thay thế linh kiện" }
            };
            return Ok(types);
        }

        // GET: api/maintenance/options/statuses
        [HttpGet("options/statuses")]
        public IActionResult GetMaintenanceStatuses()
        {
            var statuses = new[]
            {
                new { value = "scheduled", label = "Đã lên lịch" },
                new { value = "processing", label = "Đang thực hiện" },
                new { value = "completed", label = "Hoàn thành" },
                new { value = "overdue", label = "Quá hạn" }
            };
            return Ok(statuses);
        }
    }
}
