using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class TripStepRepository: GenericRepository<TripStep>, ITripStepRepository
    {
        public TripStepRepository(FMSDbContext context) : base(context)
        {
        }
    }
   
}
