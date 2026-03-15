using FMS.Pagination;
using FMS.ServiceLayer.DTO.VehicleDto;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("fixed")]
    public class VehicleController: ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        public VehicleController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }


        [HttpGet]
        public async Task<IActionResult> GetVehicles([FromQuery] VehicleParams @params)
        {
            try
            {
                var vehicles = await _vehicleService.GetVehiclesAsync(@params);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpGet("{vehicleId}")]
        public async Task<IActionResult> GetVehicleDetails(int vehicleId)
        {
            try
            {
                var vehicleDetails = await _vehicleService.GetVehicleDetailsAsync(vehicleId);
                if (vehicleDetails == null)
                {
                    return NotFound(new { message = "Vehicle not found" });
                }
                return Ok(vehicleDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpPost]
        [EnableRateLimiting("fixed")]
        public async Task<IActionResult> CreateVehicle([FromBody] VehicleCreateDto dto)
        {
            try
            {
                var createdVehicle = await _vehicleService.CreateVehicleAsync(dto);
                return CreatedAtAction(nameof(GetVehicleDetails), new { vehicleId = createdVehicle.VehicleID }, createdVehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{vehicleId}")]
        public async Task<IActionResult> UpdateVehicle(int vehicleId, [FromBody] VehicleUpdateDto dto)
        {
            try
            {
                var result = await _vehicleService.UpdateVehicleAsync(vehicleId, dto);
                return result ? Ok(new { message = "Vehicle updated successfully" }) : NotFound(new { message = "Vehicle not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{vehicleId}")]
        public async Task<IActionResult> DeleteVehicle(int vehicleId)
        {
            try
            {
                var result = await _vehicleService.DeleteVehicleAsync(vehicleId);
                return result ? Ok(new { message = "Vehicle deleted successfully" }) : NotFound(new { message = "Vehicle not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/vehicle/options/statuses
        [HttpGet("options/statuses")]
        public IActionResult GetVehicleStatuses()
        {
            var statuses = new[]
            {
                new { value = "available", label = "Sẵn sàng" },
                new { value = "in_use", label = "Đang dùng" },
                new { value = "maintenance", label = "Bảo trì" }
            };
            return Ok(statuses);
        }

        // GET: api/vehicle/options/types
        [HttpGet("options/types")]
        public IActionResult GetVehicleTypes()
        {
            var types = new[]
            {
                new { value = "Xe tải 8 tấn", label = "Xe tải 8 tấn" },
                new { value = "Xe 16 chỗ", label = "Xe 16 chỗ" },
                new { value = "Xe tải nhẹ", label = "Xe tải nhẹ" },
                new { value = "Xe tải lớn", label = "Xe tải lớn" },
                new { value = "Xe tải 2.5 tấn", label = "Xe tải 2.5 tấn" },
                new { value = "Xe tải 5 tấn", label = "Xe tải 5 tấn" },
                new { value = "Xe 12 chỗ", label = "Xe 12 chỗ" },
                new { value = "Xe tải 7 tấn", label = "Xe tải 7 tấn" },
                new { value = "Xe tải 6 tấn", label = "Xe tải 6 tấn" },
                new { value = "Xe bán tải", label = "Xe bán tải" },
                new { value = "SUV 7 chỗ", label = "SUV 7 chỗ" },
                new { value = "Xe tải 5.5 tấn", label = "Xe tải 5.5 tấn" },
                new { value = "Xe tải 3.5 tấn", label = "Xe tải 3.5 tấn" },
                new { value = "Xe cointainer", label = "Xe container" }
            };
            return Ok(types);
        }

        // GET: api/vehicle/options/fuel-types
        [HttpGet("options/fuel-types")]
        public IActionResult GetFuelTypes()
        {
            var fuelTypes = new[]
            {
                new { value = "Xăng", label = "Xăng" },
                new { value = "Dầu", label = "Dầu" },
                new { value = "Điện", label = "Điện" },
                new { value = "Hybrid", label = "Hybrid" }
            };
            return Ok(fuelTypes);
        }

        // GET: api/vehicle/options/brands
        [HttpGet("options/brands")]
        public IActionResult GetVehicleBrands()
        {
            var brands = new[]
            {
                new { value = "Toyota", label = "Toyota" },
                new { value = "Honda", label = "Honda" },
                new { value = "Ford", label = "Ford" },
                new { value = "Hyundai", label = "Hyundai" },
                new { value = "Isuzu", label = "Isuzu" },
                new { value = "Hino", label = "Hino" },
                new { value = "Thaco", label = "Thaco" }
            };
            return Ok(brands);
        }
    }
}
