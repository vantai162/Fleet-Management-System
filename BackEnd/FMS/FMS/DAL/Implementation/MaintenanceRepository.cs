using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class MaintenanceRepository: GenericRepository<Maintenance>, IMaintenanceRepository
    {
        public MaintenanceRepository(FMSDbContext context) : base(context)
        {
        }
    }
 
}
