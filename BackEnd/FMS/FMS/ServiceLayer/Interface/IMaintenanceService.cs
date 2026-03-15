using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.MaintenanceDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IMaintenanceService
    {
        Task<List<ServiceDto>> GetAllServiceAsync();
        Task<PaginatedResult<MaintenanceListDto>> GetAllInvoiceAsync(MaintenanceParams @params);
        Task<int> CreateMaintenanceAsync(CreateMaintenanceDto dto);
        Task<MaintenanceStatsDto> GetMaintenanceStatsAsync();
        Task<MaintenanceDetailDto> GetMaintenanceByIdAsync(int id);
    }
}
