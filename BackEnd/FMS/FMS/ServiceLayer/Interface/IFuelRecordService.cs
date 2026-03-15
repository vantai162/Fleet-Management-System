using FMS.ServiceLayer.DTO.FuelRecordDto;
using FMS.Models;
using FMS.Pagination;

namespace FMS.ServiceLayer.Interface
{
    public interface IFuelRecordService
    {
        Task<PaginatedResult<FuelRecordListDto>> GetAllAsync(FuelRecordParams @params);
        Task<IEnumerable<FuelRecordListDto>> GetByTripIdAsync(int tripId);
        Task<FuelRecordListDto> GetByIdAsync(int id);
        Task<FuelRecordListDto> CreateAsync(CreateFuelRecordDto dto);
        Task<bool> DeleteAsync(int id);
    }
}



