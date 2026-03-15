using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class DriverLicenseRepository: GenericRepository<DriverLicense>, IDriverLicenseRepository
    {
        public DriverLicenseRepository(FMSDbContext context) : base(context)
        {
        }
    }
    
}
