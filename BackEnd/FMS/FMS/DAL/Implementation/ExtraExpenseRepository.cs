using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class ExtraExpenseRepository: GenericRepository<ExtraExpense>, IExtraExpenseRepository
    {
        public ExtraExpenseRepository(FMSDbContext context) : base(context)
        {
        }
    }
}
