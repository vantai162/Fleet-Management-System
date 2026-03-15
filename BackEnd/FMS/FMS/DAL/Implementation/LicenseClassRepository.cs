using FMS.DAL.Interfaces;
using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class LicenseClassRepository: GenericRepository<LicenseClass>, ILicenseClassRepository
    {
        public LicenseClassRepository(FMSDbContext context) : base(context)
        {
        }
    }
  
}
