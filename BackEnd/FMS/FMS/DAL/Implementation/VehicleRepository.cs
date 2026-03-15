using FMS.DAL.Interfaces;
using FMS.Models;


namespace FMS.DAL.Implementation
{
    public class VehicleRepository : GenericRepository<Vehicle>, IVehicleRepository
    {
        public VehicleRepository(FMSDbContext context) : base(context)
        {
        }
    }
}


