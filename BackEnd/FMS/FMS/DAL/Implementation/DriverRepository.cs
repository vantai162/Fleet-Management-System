using FMS.DAL.Interfaces;
using FMS.Models;


namespace FMS.DAL.Implementation
{
    public class DriverRepository : GenericRepository<Driver>, IDriverRepository
    {
        public DriverRepository(FMSDbContext context) : base(context)
        {
        }
    }
}


