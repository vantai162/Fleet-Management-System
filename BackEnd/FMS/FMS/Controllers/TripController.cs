using FMS.Pagination;
using FMS.Models;
using FMS.ServiceLayer.DTO.TripDto;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class TripController: ControllerBase
    {
        private readonly ITripService _tripService;
        public TripController(ITripService tripService)
        {
            _tripService = tripService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTripsAsync([FromQuery] TripParams @params)
        {
            var trips = await _tripService.GetTripsAsync(@params);
            return Ok(trips);
        }
        [HttpGet("stats")]
        public async Task<IActionResult> GetTripStatsAsync()
        {
            // Placeholder for future implementation
            var stats = await _tripService.GetTripStatsAsync();
            return Ok(stats);
        }
        [HttpGet("{tripId}/orders")]
        public async Task<IActionResult> GetOrdersAsync(int tripId)
        {
            var order = await _tripService.GetOrdersByIdAsync(tripId);
            return Ok(order);
        }
        // Confirm a trip step (e.g. GPS, phone, delivery)
        [HttpPut("{tripId}/step/{stepKey}/confirm")]
        public async Task<IActionResult> ConfirmTripStep(int tripId, string stepKey)
        {
            try
            {
                var updated = await _tripService.ConfirmTripStepAsync(tripId, stepKey);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("booked")]
        public async Task<IActionResult> GetBookedTripsAsync([FromQuery] BookedTripParams @params)
        {
            var bookedTrips = await _tripService.GetBookedTripListAsync(@params);
            return Ok(bookedTrips);
        }
        [HttpGet("booked/stats")]
        public async Task<IActionResult> GetBookedTripStatsAsync()
        {
            var bookedTripStats = await _tripService.GetBookedTripStatsAsync();
            return Ok(bookedTripStats);
        }
        [HttpPost("booked")]
        [EnableRateLimiting("fixed")]
        public async Task<IActionResult> CreateBookingTripAsync([FromBody] CreateBookingTripDto dto)
        {
            Trip? createdTrip = null;
            try
            {
                createdTrip = await _tripService.CreateBookingTripAsync(dto);
                // Return minimal payload; parent can fetch details via GET /api/Trip/{id}/orders
                var location = $"/api/Trip/{createdTrip.TripID}/orders";
                return Created(location, new { tripId = createdTrip.TripID });
            }
            catch (Exception ex)
            {
                // If trip was created but an error occurred afterwards, return Created with warning.
                if (createdTrip != null)
                {
                    var location = $"/api/Trip/{createdTrip.TripID}/orders";
                    return Created(location, new { tripId = createdTrip.TripID, warning = "Created but failed to build full details" });
                }

                // Otherwise return 500 with a safe message.
                return Problem(detail: "Failed to create booking", statusCode: 500);
            }
        }

        // POST: api/trip/estimate
        // Run estimations and update trips in DB (ActualDurationMin=NULL, RouteGeometryJson="string",
        // fill EstimatedDistanceKm and EstimatedDurationMin if missing)
        [HttpPost("estimate")]
        public async Task<IActionResult> EstimateAndUpdateTrips()
        {
            try
            {
                var updated = await _tripService.EstimateAndUpdateTripsAsync();
                return Ok(new { updated });
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // GET: api/trip/options/statuses
        [HttpGet("options/statuses")]
        public IActionResult GetTripStatuses()
        {
            var statuses = new[]
            {
                new { value = "waiting", label = "Chờ xử lý" },
                new { value = "confirmed", label = "Đã xác nhận" },
                new { value = "in_transit", label = "Đang thực hiện" },
                new { value = "completed", label = "Hoàn thành" }
            };
            return Ok(statuses);
        }

        // PUT: api/trip/booked/{tripId}/cancel
        [HttpDelete("/{tripId}/cancel")]
        public async Task<IActionResult> CancelBookedTrip(int tripId)
        {
            var result = await _tripService.CancelTripAsync(tripId);
            return result ? Ok(new { message = "Đã hủy lịch đặt trước" }) : NotFound(new { message = "Không tìm thấy lịch đặt trước" });
        }

        // PUT: api/trip/booked/{tripId}/confirm
        [HttpPut("booked/{tripId}/confirm")]
        public async Task<IActionResult> ConfirmBookedTrip(int tripId)
        {
            var result = await _tripService.ConfirmBookedTripAsync(tripId);
            return result ? Ok(new { message = "Đã xác nhận lịch đặt trước" }) : NotFound(new { message = "Không tìm thấy lịch đặt trước" });
        }

        
    }
}
