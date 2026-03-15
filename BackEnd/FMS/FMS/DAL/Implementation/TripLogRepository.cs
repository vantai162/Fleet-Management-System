using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class TripLogRepository: GenericRepository<TripLog>, ITripLogRepository
    {
        public TripLogRepository(FMSDbContext context) : base(context)
        {
        }
    }
   
}
