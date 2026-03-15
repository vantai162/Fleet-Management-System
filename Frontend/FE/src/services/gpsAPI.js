// Mock data và service cho GPS Tracking

export const mockVehicleLocations = [
  {
    id: "29A-12345",
    name: "Nguyễn Văn A",
    lat: 21.0285,
    lng: 105.8542,
    status: "moving",
    speed: 65,
    fuel: 75,
    destination: "Hải Phòng",
    lastUpdate: "2 phút trước",
  },
  {
    id: "30B-98765",
    name: "Trần Văn B",
    lat: 20.4388,
    lng: 106.1621,
    status: "moving",
    speed: 60,
    fuel: 45,
    destination: "Nam Định",
    lastUpdate: "5 phút trước",
  },
  {
    id: "51F-11111",
    name: "Hoàng Thị E",
    lat: 20.4501,
    lng: 106.3433,
    status: "moving",
    speed: 55,
    fuel: 80,
    destination: "Thái Bình",
    lastUpdate: "1 phút trước",
  },
  {
    id: "29A-54321",
    name: "Lê Văn D",
    lat: 21.0245,
    lng: 105.8412,
    status: "idle",
    speed: 0,
    fuel: 30,
    destination: null,
    lastUpdate: "10 phút trước",
  },
];

export const mockAlerts = [
  {
    id: 1,
    type: "geofencing",
    vehicle: "29A-12345",
    message: "Xe đã vào vùng cấm tại 10:30 AM",
    time: "30 phút trước",
    severity: "warning",
  },
  {
    id: 2,
    type: "geofencing",
    vehicle: "30B-98765",
    message: "Xe đang quá tốc độ cho phép",
    time: "1 giờ trước",
    severity: "warning",
  },
];

export const getGPSStats = () => ({
  moving: 2,
  idle: 1,
  alert: 1,
  geofencing: 2,
});

export const getVehicleLocations = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVehicleLocations), 300);
  });
};

export const getAlerts = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAlerts), 300);
  });
};

export const getVehicleList = () => {
  return mockVehicleLocations.map((v) => ({
    id: v.id,
    driver: v.name,
    status: v.status,
    location: v.destination || "Đang nghỉ",
    speed: v.speed,
    fuel: v.fuel,
    lastUpdate: v.lastUpdate,
  }));
};
