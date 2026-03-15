using FMS.DAL.Interfaces;
using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.ExtraExpenseDto;
using FMS.ServiceLayer.Interface;
using Microsoft.EntityFrameworkCore;

namespace FMS.ServiceLayer.Implementation
{
    public class ExtraExpenseService : IExtraExpenseService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExtraExpenseService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaginatedResult<ExtraExpenseListDto>> GetAllAsync(ExtraExpenseParams @params)
        {
            var query = _unitOfWork.ExtraExpenses.Query().AsNoTracking();

            if (@params.TripId.HasValue)
            {
                query = query.Where(e => e.TripID == @params.TripId.Value);
            }

            if (!string.IsNullOrEmpty(@params.Keyword))
            {
                var kw = @params.Keyword.Trim().ToLowerInvariant();
                query = query.Where(e =>
                    e.ExpenseType.ToLower().Contains(kw) ||
                    (e.Location != null && e.Location.ToLower().Contains(kw)) ||
                    (e.Description != null && e.Description.ToLower().Contains(kw))
                );
            }

            if (@params.FromDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate >= @params.FromDate.Value);
            }
            if (@params.ToDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate <= @params.ToDate.Value);
            }

            if (@params.MinAmount.HasValue)
            {
                query = query.Where(e => e.Amount >= @params.MinAmount.Value);
            }
            if (@params.MaxAmount.HasValue)
            {
                query = query.Where(e => e.Amount <= @params.MaxAmount.Value);
            }

            // sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                query = @params.SortBy.ToLower() switch
                {
                    "amount" => @params.IsDescending ? query.OrderByDescending(e => e.Amount) : query.OrderBy(e => e.Amount),
                    "expenseDate" => @params.IsDescending ? query.OrderByDescending(e => e.ExpenseDate) : query.OrderBy(e => e.ExpenseDate),
                    _ => @params.IsDescending ? query.OrderByDescending(e => e.ExpenseDate) : query.OrderBy(e => e.ExpenseDate)
                };
            }
            else
            {
                query = query.OrderByDescending(e => e.ExpenseDate);
            }

            var dtoQuery = query.Select(e => new ExtraExpenseListDto
            {
                Id = e.ExtraExpenseID,
                TripId = e.TripID,
                ExpenseType = e.ExpenseType,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                Location = e.Location,
                Description = e.Description
            });

            return await dtoQuery.paginate(@params.PageSize, @params.PageNumber);
        }

        public async Task<ExtraExpenseListDto?> GetByIdAsync(int id)
        {
            if (id <= 0) return null;
            var entity = await _unitOfWork.ExtraExpenses.GetByIdAsync(id);
            if (entity == null) return null;
            return new ExtraExpenseListDto
            {
                Id = entity.ExtraExpenseID,
                TripId = entity.TripID,
                ExpenseType = entity.ExpenseType,
                Amount = entity.Amount,
                ExpenseDate = entity.ExpenseDate,
                Location = entity.Location,
                Description = entity.Description
            };
        }

        public async Task<int> CreateExtraExpenseAsync(CreateExtraExpenseDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var entity = new ExtraExpense
            {
                TripID = dto.TripId,
                ExpenseType = dto.ExpenseType,
                Amount = dto.Amount,
                ExpenseDate = dto.ExpenseDate ?? DateTime.Now,
                Location = dto.Location,
                Description = dto.Description
            };

            await _unitOfWork.ExtraExpenses.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            return entity.ExtraExpenseID;
        }
    }
}


