using FMS.Models;

namespace FMS.DAL.Implementation
{
    public class EmergencyReportRepository: GenericRepository<Models.EmergencyReport>, Interfaces.IEmergencyReportRepository
    {
        public EmergencyReportRepository(FMSDbContext context) : base(context)
        {
        }
    }
}
