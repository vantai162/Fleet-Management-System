using FMS.Pagination;
using FMS.ServiceLayer.DTO.DriverDto;
using FMS.ServiceLayer.Implementation;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class DriverController: ControllerBase
    {
        private readonly IDriverService _driverService;
        public DriverController(IDriverService driverService)
        {
            _driverService = driverService;
        }


        [HttpGet]
        public async Task<IActionResult> GetDrivers([FromQuery] DriverParams @params)
        {
            try
            {
                var drivers = await _driverService.GetDriversAsync(@params);
                return Ok(drivers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpGet("{driverId}")]
        public async Task<IActionResult> GetDriverDetails(int driverId)
        {
            try
            {
                var driverDetails = await _driverService.GetDriverDetailsAsync(driverId);
                return Ok(driverDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{driverId}/history")]
        public async Task<IActionResult> GetDriverHistory(int driverId)
        {
            try
            {
                var history = await _driverService.GetDriverHistoryAsync(driverId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpPost]
        [EnableRateLimiting("fixed")]
        public async Task<IActionResult> CreateDriver([FromBody] RegisterDriverDto dto)
        {
            var result = await _driverService.RegisterDriverAsync(dto);
            return Ok(result);
        }

        [HttpPut("{driverId}")]
        public async Task<IActionResult> UpdateDriver(int driverId, [FromBody] UpdateDriverDto dto)
        {
            try
            {
                var result = await _driverService.UpdateDriverAsync(driverId, dto);
                return result ? Ok(new { message = "Driver updated successfully" }) : NotFound(new { message = "Driver not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{driverId}")]
        public async Task<IActionResult> DeleteDriver(int driverId)
        {
            try
            {
                var result = await _driverService.DeleteDriverAsync(driverId);
                return result ? Ok(new { message = "Driver deleted successfully" }) : NotFound(new { message = "Driver not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/driver/options/statuses
        [HttpGet("options/statuses")]
        public IActionResult GetDriverStatuses()
        {
            var statuses = new[]
            {
                new { value = "available", label = "Sẵn sàng" },
                new { value = "on_trip", label = "Đang chạy" },
                new { value = "offline", label = "Nghỉ" }
            };
            return Ok(statuses);
        }
    }
}
