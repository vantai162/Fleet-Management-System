using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentController: ControllerBase
    {
        private readonly ITripAssignmentService _tripAssignmentService;
        public AssignmentController(ITripAssignmentService tripAssignmentService)
        {
            _tripAssignmentService = tripAssignmentService;
        }

        [HttpGet("{tripId}/available-vehicles")]
        public async Task<IActionResult> GetAvailableVehiclesForTripAsync()
        {
            var vehicles = await _tripAssignmentService.GetAvailableVehiclesForTripAsync();
            return Ok(vehicles);
        }

        [HttpGet("vehicles/{vehicleId}/available-drivers")]
        public async Task<IActionResult> GetAvailableDriversForVehicleAsync(int vehicleId)
        {
            var drivers = await _tripAssignmentService.GetAvailableDriversForVehicleAsync(vehicleId);
            return Ok(drivers);
        }

        [HttpPost("{tripId}/assign")]
        public async Task<IActionResult> AssignVehicleAndDriverAsync(
            int tripId,int vehicleId, int driverId
        )
        {
            var stepsCreated = await _tripAssignmentService.AssignVehicleAndDriverAsync(
                tripId,
                vehicleId,
                driverId
            );
            return Ok(new { message = "Vehicle and driver assigned successfully.", stepsCreated });
        }
    }
}
