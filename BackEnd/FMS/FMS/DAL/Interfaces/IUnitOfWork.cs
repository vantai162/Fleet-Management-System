using Microsoft.EntityFrameworkCore.Storage;

namespace FMS.DAL.Interfaces
{
    //gom het tat ca repository vao 1 transaction duy nhat de tranh viec save changes nhieu lan
    public interface IUnitOfWork : IAsyncDisposable
    {

        IUserRepository Users { get; }
        IDriverRepository Drivers { get; }
        IVehicleRepository Vehicles { get; }
        ITripRepository Trips { get; }

        IDriverLicenseRepository DriverLicenses { get; }

        IExtraExpenseRepository ExtraExpenses { get; }
        IFuelRecordRepository FuelRecords { get; }
        ILicenseClassRepository LicenseClasses { get; }
        IMaintenanceRepository Maintenances { get; }
        ITripDriverRepository TripDrivers { get; }
        ITripLogRepository TripLogs { get; }
        
        IMaintenanceServiceRepository MaintenanceServices { get; }
        IServiceRepository Services { get; }
        ITripStepRepository TripSteps { get; }
        IEmergencyReportRepository EmergencyReports { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}

