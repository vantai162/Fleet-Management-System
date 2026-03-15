using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMS.Migrations
{
    /// <inheritdoc />
    public partial class TenMigrationCuaBan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    DriverID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TotalTrips = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    ExperienceYears = table.Column<int>(type: "int", nullable: false),
                    DriverStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.DriverID);
                });

            migrationBuilder.CreateTable(
                name: "LicenseClasses",
                columns: table => new
                {
                    LicenseClassID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    LicenseDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LicenseClasses", x => x.LicenseClassID);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    ServiceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ServicePrice = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsReceivingEmailNofication = table.Column<bool>(type: "bit", nullable: false),
                    IsReceivingMaintainNofication = table.Column<bool>(type: "bit", nullable: false),
                    IsReceivingGeoNofication = table.Column<bool>(type: "bit", nullable: false),
                    IsReceivingReportNofication = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "DriverLicenses",
                columns: table => new
                {
                    DriverLicenseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverID = table.Column<int>(type: "int", nullable: false),
                    LicenseClassID = table.Column<int>(type: "int", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverLicenses", x => x.DriverLicenseID);
                    table.ForeignKey(
                        name: "FK_DriverLicenses_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DriverLicenses_LicenseClasses_LicenseClassID",
                        column: x => x.LicenseClassID,
                        principalTable: "LicenseClasses",
                        principalColumn: "LicenseClassID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    VehicleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LicensePlate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VehicleModel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    VehicleType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ManufacturedYear = table.Column<int>(type: "int", nullable: true),
                    CurrentKm = table.Column<int>(type: "int", nullable: true),
                    VehicleStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DriverID = table.Column<int>(type: "int", nullable: true),
                    RequiredLicenseClassID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.VehicleID);
                    table.ForeignKey(
                        name: "FK_Vehicles_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID");
                    table.ForeignKey(
                        name: "FK_Vehicles_LicenseClasses_RequiredLicenseClassID",
                        column: x => x.RequiredLicenseClassID,
                        principalTable: "LicenseClasses",
                        principalColumn: "LicenseClassID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Maintenances",
                columns: table => new
                {
                    MaintenanceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinishedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GarageName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TechnicianName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalCost = table.Column<double>(type: "float", nullable: false),
                    MaintenanceStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maintenances", x => x.MaintenanceID);
                    table.ForeignKey(
                        name: "FK_Maintenances_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    TripID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartLocation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    EndLocation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TotalDistanceKm = table.Column<int>(type: "int", nullable: true),
                    TotalFuelConsumed = table.Column<double>(type: "float", nullable: true),
                    TripStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    VehicleID1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.TripID);
                    table.ForeignKey(
                        name: "FK_Trips_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Trips_Vehicles_VehicleID1",
                        column: x => x.VehicleID1,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                });

            migrationBuilder.CreateTable(
                name: "VehicleDriverAssignments",
                columns: table => new
                {
                    AssignmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverID = table.Column<int>(type: "int", nullable: false),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    AssignedFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedTo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleDriverAssignments", x => x.AssignmentID);
                    table.ForeignKey(
                        name: "FK_VehicleDriverAssignments_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VehicleDriverAssignments_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceServices",
                columns: table => new
                {
                    MaintenanceServiceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaintenanceID = table.Column<int>(type: "int", nullable: false),
                    ServiceID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<double>(type: "float", nullable: false),
                    TotalPrice = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceServices", x => x.MaintenanceServiceID);
                    table.ForeignKey(
                        name: "FK_MaintenanceServices_Maintenances_MaintenanceID",
                        column: x => x.MaintenanceID,
                        principalTable: "Maintenances",
                        principalColumn: "MaintenanceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenanceServices_Services_ServiceID",
                        column: x => x.ServiceID,
                        principalTable: "Services",
                        principalColumn: "ServiceID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyReports",
                columns: table => new
                {
                    EmergencyID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripID = table.Column<int>(type: "int", nullable: true),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    DriverID = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReportedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RespondedByUserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyReports", x => x.EmergencyID);
                    table.ForeignKey(
                        name: "FK_EmergencyReports_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EmergencyReports_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EmergencyReports_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExtraExpenses",
                columns: table => new
                {
                    ExtraExpenseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripID = table.Column<int>(type: "int", nullable: false),
                    ExpenseType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpenseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtraExpenses", x => x.ExtraExpenseID);
                    table.ForeignKey(
                        name: "FK_ExtraExpenses_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FuelRecords",
                columns: table => new
                {
                    FuelRecordID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    DriverID = table.Column<int>(type: "int", nullable: false),
                    TripID = table.Column<int>(type: "int", nullable: true),
                    FuelTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReFuelLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FuelAmount = table.Column<double>(type: "float", nullable: false),
                    FuelCost = table.Column<double>(type: "float", nullable: false),
                    CurrentKm = table.Column<double>(type: "float", nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FuelRecords", x => x.FuelRecordID);
                    table.ForeignKey(
                        name: "FK_FuelRecords_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FuelRecords_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID");
                    table.ForeignKey(
                        name: "FK_FuelRecords_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripDrivers",
                columns: table => new
                {
                    TripDriverID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripID = table.Column<int>(type: "int", nullable: false),
                    DriverID = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TripRating = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripDrivers", x => x.TripDriverID);
                    table.ForeignKey(
                        name: "FK_TripDrivers_Drivers_DriverID",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TripDrivers_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TripLogs",
                columns: table => new
                {
                    TripLogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripID = table.Column<int>(type: "int", nullable: false),
                    LogTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DistanceFromLastKm = table.Column<int>(type: "int", nullable: false),
                    FuelUsed = table.Column<double>(type: "float", nullable: false),
                    LogType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripLogs", x => x.TripLogID);
                    table.ForeignKey(
                        name: "FK_TripLogs_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripSteps",
                columns: table => new
                {
                    TripStepID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TripID = table.Column<int>(type: "int", nullable: false),
                    StepKey = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StepLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsDone = table.Column<bool>(type: "bit", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripSteps", x => x.TripStepID);
                    table.ForeignKey(
                        name: "FK_TripSteps_Trips_TripID",
                        column: x => x.TripID,
                        principalTable: "Trips",
                        principalColumn: "TripID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DriverLicenses_DriverID_LicenseClassID",
                table: "DriverLicenses",
                columns: new[] { "DriverID", "LicenseClassID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DriverLicenses_LicenseClassID",
                table: "DriverLicenses",
                column: "LicenseClassID");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyReports_DriverID",
                table: "EmergencyReports",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyReports_TripID",
                table: "EmergencyReports",
                column: "TripID");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyReports_VehicleID",
                table: "EmergencyReports",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_ExtraExpenses_TripID",
                table: "ExtraExpenses",
                column: "TripID");

            migrationBuilder.CreateIndex(
                name: "IX_FuelRecords_DriverID",
                table: "FuelRecords",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_FuelRecords_FuelTime",
                table: "FuelRecords",
                column: "FuelTime");

            migrationBuilder.CreateIndex(
                name: "IX_FuelRecords_TripID",
                table: "FuelRecords",
                column: "TripID");

            migrationBuilder.CreateIndex(
                name: "IX_FuelRecords_VehicleID",
                table: "FuelRecords",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_Maintenances_VehicleID",
                table: "Maintenances",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceServices_MaintenanceID",
                table: "MaintenanceServices",
                column: "MaintenanceID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceServices_ServiceID",
                table: "MaintenanceServices",
                column: "ServiceID");

            migrationBuilder.CreateIndex(
                name: "IX_TripDrivers_DriverID",
                table: "TripDrivers",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_TripDrivers_TripID_DriverID",
                table: "TripDrivers",
                columns: new[] { "TripID", "DriverID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TripLogs_TripID_LogTime",
                table: "TripLogs",
                columns: new[] { "TripID", "LogTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_StartTime",
                table: "Trips",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleID",
                table: "Trips",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleID1",
                table: "Trips",
                column: "VehicleID1");

            migrationBuilder.CreateIndex(
                name: "IX_TripSteps_TripID_StepKey",
                table: "TripSteps",
                columns: new[] { "TripID", "StepKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_DriverID",
                table: "VehicleDriverAssignments",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_VehicleID",
                table: "VehicleDriverAssignments",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_DriverID",
                table: "Vehicles",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_LicensePlate",
                table: "Vehicles",
                column: "LicensePlate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_RequiredLicenseClassID",
                table: "Vehicles",
                column: "RequiredLicenseClassID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DriverLicenses");

            migrationBuilder.DropTable(
                name: "EmergencyReports");

            migrationBuilder.DropTable(
                name: "ExtraExpenses");

            migrationBuilder.DropTable(
                name: "FuelRecords");

            migrationBuilder.DropTable(
                name: "MaintenanceServices");

            migrationBuilder.DropTable(
                name: "TripDrivers");

            migrationBuilder.DropTable(
                name: "TripLogs");

            migrationBuilder.DropTable(
                name: "TripSteps");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "VehicleDriverAssignments");

            migrationBuilder.DropTable(
                name: "Maintenances");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "LicenseClasses");
        }
    }
}
