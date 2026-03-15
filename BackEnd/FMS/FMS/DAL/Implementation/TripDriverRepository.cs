using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class TripDriverRepository: GenericRepository<TripDriver>, ITripDriverRepository
    {
        public TripDriverRepository(FMSDbContext context) : base(context)
        {
        }
    }
}
