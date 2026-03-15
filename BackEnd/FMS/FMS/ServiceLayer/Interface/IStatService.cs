using FMS.ServiceLayer.DTO.DashboardDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IStatService
    {
        Task<List<TopCardDto>> GetTopCardsAsync();
        Task<DashboardStatDto> GetDashboardStatsAsync();
    }
}
