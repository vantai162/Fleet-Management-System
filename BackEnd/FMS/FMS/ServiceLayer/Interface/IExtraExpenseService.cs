using FMS.Pagination;
using FMS.ServiceLayer.DTO.ExtraExpenseDto;

namespace FMS.ServiceLayer.Interface
{
    public interface IExtraExpenseService
    {
        Task<PaginatedResult<ExtraExpenseListDto>> GetAllAsync(ExtraExpenseParams @params);
        Task<ExtraExpenseListDto?> GetByIdAsync(int id);
        Task<int> CreateExtraExpenseAsync(CreateExtraExpenseDto dto);
    }
}


