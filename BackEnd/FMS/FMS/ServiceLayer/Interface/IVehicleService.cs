using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.DriverDto;
using FMS.ServiceLayer.DTO.VehicleDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IVehicleService
    {
        Task<PaginatedResult<VehicleListDto>> GetVehiclesAsync(VehicleParams @params);
        Task<VehicleDetailDto?> GetVehicleDetailsAsync(int vehicleId);
        Task<Vehicle> CreateVehicleAsync(VehicleCreateDto dto);
        Task<bool> UpdateVehicleAsync(int vehicleId, VehicleUpdateDto dto);
        Task<bool> DeleteVehicleAsync(int vehicleId);
    }
}
