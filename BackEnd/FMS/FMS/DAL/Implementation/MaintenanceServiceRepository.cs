using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class MaintenanceServiceRepository: GenericRepository<MaintenanceService>, IMaintenanceServiceRepository
    {
        public MaintenanceServiceRepository(FMSDbContext context) : base(context)
        {
        }
    }
    
}
