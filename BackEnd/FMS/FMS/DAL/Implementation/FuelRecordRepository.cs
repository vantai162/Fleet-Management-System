using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class FuelRecordRepository: GenericRepository<FuelRecord>, IFuelRecordRepository
    {
        public FuelRecordRepository(FMSDbContext context) : base(context)
        {
        }
    }
   
}
