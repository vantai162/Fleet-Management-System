using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMS.Migrations
{
    /// <inheritdoc />
    public partial class ExpandRouteGeometryJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Vehicles_VehicleID1",
                table: "Trips");

            migrationBuilder.DropTable(
                name: "VehicleDriverAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Trips_VehicleID1",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "FuelType",
                table: "FuelRecords");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Drivers");

            migrationBuilder.RenameColumn(
                name: "VehicleID1",
                table: "Trips",
                newName: "RequestedPassengers");

            migrationBuilder.AddColumn<string>(
                name: "Capacity",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FuelType",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleBrand",
                table: "Vehicles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthPlace",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "VehicleID",
                table: "Trips",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ActualDurationMin",
                table: "Trips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Trips",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDistanceKm",
                table: "Trips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDurationMin",
                table: "Trips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestedCargo",
                table: "Trips",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestedVehicleType",
                table: "Trips",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RouteGeometryJson",
                table: "Trips",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledStartTime",
                table: "Trips",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaintenanceType",
                table: "Maintenances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextMaintenanceDate",
                table: "Maintenances",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NextMaintenanceKm",
                table: "Maintenances",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Maintenances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rank",
                table: "LicenseClasses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<double>(
                name: "Rating",
                table: "Drivers",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<string>(
                name: "GPLX",
                table: "Drivers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "Drivers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_UserID",
                table: "Drivers",
                column: "UserID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Users_UserID",
                table: "Drivers",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Users_UserID",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_UserID",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "FuelType",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "VehicleBrand",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BirthPlace",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ActualDurationMin",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "EstimatedDistanceKm",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "EstimatedDurationMin",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "RequestedCargo",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "RequestedVehicleType",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "RouteGeometryJson",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ScheduledStartTime",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "MaintenanceType",
                table: "Maintenances");

            migrationBuilder.DropColumn(
                name: "NextMaintenanceDate",
                table: "Maintenances");

            migrationBuilder.DropColumn(
                name: "NextMaintenanceKm",
                table: "Maintenances");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Maintenances");

            migrationBuilder.DropColumn(
                name: "Rank",
                table: "LicenseClasses");

            migrationBuilder.DropColumn(
                name: "GPLX",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Drivers");

            migrationBuilder.RenameColumn(
                name: "RequestedPassengers",
                table: "Trips",
                newName: "VehicleID1");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "VehicleID",
                table: "Trips",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FuelType",
                table: "FuelRecords",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<double>(
                name: "Rating",
                table: "Drivers",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Drivers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Drivers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.CreateIndex(
                name: "IX_Trips_VehicleID1",
                table: "Trips",
                column: "VehicleID1");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_DriverID",
                table: "VehicleDriverAssignments",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDriverAssignments_VehicleID",
                table: "VehicleDriverAssignments",
                column: "VehicleID");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Vehicles_VehicleID1",
                table: "Trips",
                column: "VehicleID1",
                principalTable: "Vehicles",
                principalColumn: "VehicleID");
        }
    }
}
