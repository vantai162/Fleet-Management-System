using FMS.Models;
using FMS.ServiceLayer.DTO.AssignmentDto;

namespace FMS.ServiceLayer.Interface
{
    public interface ITripAssignmentService
    {
        Task<List<SuitableVehicleDto>> GetAvailableVehiclesForTripAsync();
        Task<List<SuitableDriverDto>> GetAvailableDriversForVehicleAsync(int vehicleId);
        Task<bool> AssignVehicleAndDriverAsync(
            int tripId,
            int vehicleId,
            int driverId
        );

    }
}
