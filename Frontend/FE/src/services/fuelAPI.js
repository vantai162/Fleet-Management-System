// Mock data và service cho quản lý nhiên liệu

export const mockFuelRecords = [
  {
    id: 1,
    time: "01/12/2024 08:30",
    vehicle: "29A-12345",
    driver: "Nguyễn Văn A",
    location: "Petrolimex Hà Nội",
    amount: "50L",
    cost: "1.250.000₫",
    distance: "45.000 km",
    station: "P1",
  },
  {
    id: 2,
    time: "01/12/2024 09:15",
    vehicle: "30B-98765",
    driver: "Trần Văn B",
    location: "Petrolimex Nam Định",
    amount: "45L",
    cost: "1.035.000₫",
    distance: "32.000 km",
    station: "P2",
  },
  {
    id: 3,
    time: "01/12/2024 07:45",
    vehicle: "51F-11111",
    driver: "Hoàng Thị E",
    location: "Petrolimex Thái Bình",
    amount: "40L",
    cost: "920.000₫",
    distance: "68.000 km",
    station: "P3",
  },
  {
    id: 4,
    time: "01/12/2024 14:20",
    vehicle: "29A-12345",
    driver: "Nguyễn Văn A",
    location: "Petrolimex Hà Phòng",
    amount: "48L",
    cost: "1.104.000₫",
    distance: "44.850 km",
    station: "P1",
  },
  {
    id: 5,
    time: "30/11/2024 10:30",
    vehicle: "30D-33333",
    driver: "Lê Thị C",
    location: "Petrolimex Hưng Yên",
    amount: "35L",
    cost: "805.000₫",
    distance: "52.000 km",
    station: "P5",
  },
];

export const getFuelStats = () => ({
  totalFuel: "218L",
  fuelChange: "+5% so với tháng trước",
  totalCost: "5.0M",
  costChange: "-2% so với tháng trước",
  avgConsumption: "43.6L",
  consumptionChange: "Hiệu suất tốt",
  totalStations: "230000",
  stationsChange: "Giá tăng hôm nay",
});

export const getFuelChartData = () => ({
  consumption: [
    { day: "T2", value: 165 },
    { day: "T3", value: 180 },
    { day: "T4", value: 155 },
    { day: "T5", value: 190 },
    { day: "T6", value: 175 },
    { day: "T7", value: 160 },
    { day: "CN", value: 120 },
  ],
  cost: [
    { day: "T2", value: 4200 },
    { day: "T3", value: 4500 },
    { day: "T4", value: 3800 },
    { day: "T5", value: 4800 },
    { day: "T6", value: 4400 },
    { day: "T7", value: 4000 },
    { day: "CN", value: 3000 },
  ],
});

export const getFuelRecords = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockFuelRecords), 300);
  });
};
