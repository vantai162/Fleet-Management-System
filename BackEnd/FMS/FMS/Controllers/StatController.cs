using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatController : ControllerBase
    {
        private readonly IStatService _statService;
        public StatController(IStatService statService)
        {
            _statService = statService;
        }
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStatsAsync()
        {
            var stats = await _statService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        [HttpGet("top-cards")]
        public async Task<IActionResult> GetTopCardsAsync()
        {
            var topCards = await _statService.GetTopCardsAsync();
            return Ok(topCards);
        }
    }
}
