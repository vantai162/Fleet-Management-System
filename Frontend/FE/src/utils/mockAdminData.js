export const stats = {
  totalVehicles: 12,
  totalDrivers: 8,
  tripsToday: 5,
  pendingTrips: 2,
};

export const recentTrips = [
  {
    id: "T001",
    route: "UIT -> District 1",
    driverName: "Nguyen A",
    vehiclePlate: "51A-12345",
    status: "DONE",
  },
  {
    id: "T002",
    route: "UIT -> Thu Duc",
    driverName: "Tran B",
    vehiclePlate: "51B-77889",
    status: "PENDING",
  },
];

export const vehiclesSeed = [
  { id: "V001", plate: "51A-12345", type: "Sedan", status: "AVAILABLE" },
  { id: "V002", plate: "51B-77889", type: "SUV", status: "MAINTENANCE" },
];

export const driversSeed = [
  { id: "D001", name: "Nguyen Van A", phone: "0901234567", status: "ACTIVE" },
  { id: "D002", name: "Tran Van B", phone: "0909876543", status: "OFF" },
];

export const tripsSeed = [
  {
    id: "T100",
    from: "UIT",
    to: "Q1",
    driver: "Nguyen Van A",
    vehicle: "51A-12345",
    status: "PENDING",
  },
  {
    id: "T101",
    from: "UIT",
    to: "Thu Duc",
    driver: "Tran Van B",
    vehicle: "51B-77889",
    status: "DONE",
  },
];
