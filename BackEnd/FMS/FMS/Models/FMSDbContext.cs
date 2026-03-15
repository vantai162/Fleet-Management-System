using FMS.Models;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics.Metrics;
using System.Globalization;
using System.Reflection.Emit;
using System.Transactions;

namespace FMS.Models
{
    public class FMSDbContext : DbContext
    {
        public FMSDbContext(DbContextOptions<FMSDbContext> options)
            : base(options)
        {
        }

        // ================= Reference tables =================
        public DbSet<User> Users { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<FuelRecord> FuelRecords { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }
        //public DbSet<VehicleDriverAssignment> VehicleDriverAssignments { get; set; }
        public DbSet<ExtraExpense> ExtraExpenses { get; set; }
        public DbSet<TripLog> TripLogs { get; set; }
        public DbSet<TripDriver> TripDrivers { get; set; }

        public DbSet<TripStep> TripSteps { get; set; }
        public DbSet<LicenseClass> LicenseClasses { get; set; }
        public DbSet<DriverLicense> DriverLicenses { get; set; }

        public DbSet<MaintenanceService> MaintenanceServices { get; set; }
        public DbSet<Service> Services { get; set; }

        public DbSet<EmergencyReport> EmergencyReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // ================= DRIVER - VEHICLE ASSIGNMENT =================
            /*modelBuilder.Entity<VehicleDriverAssignment>()
                .HasOne(vda => vda.Driver)
                .WithMany(d => d.VehicleAssignments)
                .HasForeignKey(vda => vda.DriverID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VehicleDriverAssignment>()
                .HasOne(vda => vda.Vehicle)
                .WithMany(v => v.VehicleAssignments)
                .HasForeignKey(vda => vda.VehicleID)
                .OnDelete(DeleteBehavior.Restrict);*/

            // ================= TRIP =================
            

            modelBuilder.Entity<Trip>()
                .HasOne(t => t.Vehicle)
                .WithMany(v => v.Trips)
                .HasForeignKey(t => t.VehicleID)
                .OnDelete(DeleteBehavior.Restrict);

            // ================= TRIP - DRIVER (MANY TO MANY) =================
            modelBuilder.Entity<TripDriver>()
                .HasOne(td => td.Trip)
                .WithMany(t => t.TripDrivers)
                .HasForeignKey(td => td.TripID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TripDriver>()
                .HasOne(td => td.Driver)
                .WithMany(d => d.TripDrivers)
                .HasForeignKey(td => td.DriverID)
                .OnDelete(DeleteBehavior.Restrict);

            // ================= TRIP LOG =================
            modelBuilder.Entity<TripLog>()
                .HasOne(tl => tl.Trip)
                .WithMany(t => t.TripLogs)
                .HasForeignKey(tl => tl.TripID);


            // ================= TRIP STEP =================
            modelBuilder.Entity<TripStep>()
                .HasOne(ts => ts.Trip)
                .WithMany(t => t.TripSteps)
                .HasForeignKey(ts => ts.TripID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TripStep>()
                .HasIndex(ts => new { ts.TripID, ts.StepKey })
                .IsUnique();

            // ================= FUEL RECORD =================
            modelBuilder.Entity<FuelRecord>()
                .HasOne(fr => fr.Trip)
                .WithMany(t => t.FuelRecords)
                .HasForeignKey(fr => fr.TripID);


            // ================= EXTRA EXPENSE =================
            modelBuilder.Entity<ExtraExpense>()
                .HasOne(ee => ee.Trip)
                .WithMany(t => t.ExtraExpenses)
                .HasForeignKey(ee => ee.TripID);


            // ================= MAINTENANCE =================
            modelBuilder.Entity<Maintenance>()
                .HasOne(m => m.Vehicle)
                .WithMany(v => v.Maintenances)
                .HasForeignKey(m => m.VehicleID);

            // ================= VEHICLE - REQUIRED LICENSE =================
            modelBuilder.Entity<Vehicle>()
                .HasOne(v => v.RequiredLicenseClass)
                .WithMany()
                .HasForeignKey(v => v.RequiredLicenseClassID)
                .OnDelete(DeleteBehavior.Restrict);

            // ================= DRIVER LICENSE =================
            modelBuilder.Entity<DriverLicense>()
                .HasOne(dl => dl.Driver)
                .WithMany(d => d.DriverLicenses)
                .HasForeignKey(dl => dl.DriverID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DriverLicense>()
                .HasOne(dl => dl.LicenseClass)
                .WithMany()
                .HasForeignKey(dl => dl.LicenseClassID)
                .OnDelete(DeleteBehavior.Restrict);

            // ================= MAINTENANCE - SS =================
            modelBuilder.Entity<MaintenanceService>()
                .HasOne(mi => mi.Maintenance)
                .WithMany(m => m.MaintenanceServices)
                .HasForeignKey(mi => mi.MaintenanceID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaintenanceService>()
                .HasOne(mi => mi.Service)
                .WithMany()
                .HasForeignKey(mi => mi.ServiceID)
                .OnDelete(DeleteBehavior.Restrict);

            // ================= Emergency Report =================
            modelBuilder.Entity<EmergencyReport>()
                .HasOne(e => e.Vehicle)
                .WithMany(v => v.EmergencyReports)
                .HasForeignKey(e => e.VehicleID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmergencyReport>()
                        .HasOne(e => e.Driver)
                        .WithMany(d => d.EmergencyReports)
                        .HasForeignKey(e => e.DriverID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EmergencyReport>()
                        .HasOne(e => e.Trip)
                        .WithMany(t => t.EmergencyReports)
                        .HasForeignKey(e => e.TripID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                        .HasOne(u => u.Driver)
                        .WithOne(d => d.User)
                        .HasForeignKey<Driver>(d => d.UserID)
                        .OnDelete(DeleteBehavior.Cascade);


            //index
            modelBuilder.Entity<Trip>()
                .HasIndex(t => t.StartTime);

            modelBuilder.Entity<FuelRecord>()
                .HasIndex(fr => fr.FuelTime);

            modelBuilder.Entity<TripLog>()
                .HasIndex(tl => new { tl.TripID, tl.LogTime });

            modelBuilder.Entity<Vehicle>()
                .HasIndex(v => v.LicensePlate)
                .IsUnique();

            modelBuilder.Entity<TripDriver>()
                .HasIndex(td => new { td.TripID, td.DriverID })
                .IsUnique();

            // Driver - License (unique)
            modelBuilder.Entity<DriverLicense>()
                .HasIndex(dl => new { dl.DriverID, dl.LicenseClassID })
                .IsUnique();


        }
    }
}

