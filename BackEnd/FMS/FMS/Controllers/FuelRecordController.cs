using FMS.ServiceLayer.DTO.FuelRecordDto;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using FMS.Pagination;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("fixed")]
    public class FuelRecordController : ControllerBase
    {
        private readonly IFuelRecordService _fuelRecordService;

        public FuelRecordController(IFuelRecordService fuelRecordService)
        {
            _fuelRecordService = fuelRecordService;
        }

        /// <summary>
        /// </summary>
        /// <remarks>Returns a PaginatedResult of FuelRecordListDto.</remarks>
        /// <param name="@params">Query parameters for pagination and filters.</param>
        [HttpGet]
        [Produces("application/json")]
        [ProducesResponseType(typeof(PaginatedResult<FuelRecordListDto>), 200)]
        public async Task<IActionResult> GetAll([FromQuery] FuelRecordParams @params)
        {
            var result = await _fuelRecordService.GetAllAsync(@params);
            return Ok(result);
        }

        // GET: api/fuelrecord/trip/5
        [HttpGet("trip/{tripId:int}")]
        public async Task<IActionResult> GetByTrip(int tripId)
        {
            var records = await _fuelRecordService.GetByTripIdAsync(tripId);
            return Ok(records);
        }

        // GET: api/fuelrecord/5
        [HttpGet("{id:int}")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(FuelRecordListDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var record = await _fuelRecordService.GetByIdAsync(id);
                return Ok(record);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // POST: api/fuelrecord
        [HttpPost]
        [Produces("application/json")]
        [ProducesResponseType(typeof(FuelRecordListDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreateFuelRecordDto dto)
        {
            try
            {
                var created = await _fuelRecordService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.FuelRecordID }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/fuelrecord/5
        [HttpDelete("{id:int}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _fuelRecordService.DeleteAsync(id);
                return result ? Ok(new { message = "Fuel record deleted" }) : BadRequest("Failed to delete fuel record");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}



