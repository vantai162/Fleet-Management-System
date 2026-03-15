using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class ServiceRepository: GenericRepository<Service>, IServiceRepository
    {
        public ServiceRepository(FMSDbContext context) : base(context)
        {
        }
    }
}
