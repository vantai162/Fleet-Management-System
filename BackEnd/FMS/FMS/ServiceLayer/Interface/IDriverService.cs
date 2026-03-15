using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.DriverDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IDriverService
    {
        Task<PaginatedResult<DriverListDto>> GetDriversAsync(DriverParams @params);
        Task<List<DriverHistoryDto>> GetDriverHistoryAsync(int driverId);
        Task<DriverDetailsDto> GetDriverDetailsAsync(int driverId);
        Task<Driver> CreateDriverAsync(int userId, CreateDriverDto dto);
        Task<DriverDetailsDto> RegisterDriverAsync(RegisterDriverDto dto);
        Task UpdateDriverRatingAsync(int driverId);
        Task<bool> UpdateDriverAsync(int driverId, UpdateDriverDto dto);
        Task<bool> DeleteDriverAsync(int driverId);
    }
}
