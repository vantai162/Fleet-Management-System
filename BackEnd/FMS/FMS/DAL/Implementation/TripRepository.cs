using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class TripRepository: GenericRepository<Trip>, ITripRepository
    {
        public TripRepository(FMSDbContext context) : base(context)
        {
        }
    }
}
