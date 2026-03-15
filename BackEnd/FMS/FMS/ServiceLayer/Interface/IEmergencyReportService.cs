using FMS.Pagination;
using FMS.ServiceLayer.DTO.EmergencyReportDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IEmergencyReportService
    {
        Task<PaginatedResult<EmergencyReportListDto>> GetAllAsync(EmergencyReportParams @params);
        Task<EmergencyReportListDto> CreateEmergencyReportAsync(CreateEmergencyReportDto dto);
        Task<EmergencyReportListDto> RespondEmergencyReportAsync(RespondEmergencyReportDto dto);
     
        Task<EmergencyReportStatsDto> GetEmergencyReportStatsAsync();
    }
}
