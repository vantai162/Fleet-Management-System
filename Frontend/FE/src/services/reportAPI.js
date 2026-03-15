// src/services/reportApi.js

const fakeDelay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getReportOverview(period = "this_month") {
  // Giả lập call API mất 500ms
  await fakeDelay(500);

  // Dữ liệu DEMO – bạn chỉnh lại cho hợp thực tế
  const base = {
    summary: {
      totalCost: 128.5,
      totalCostChange: -8, // %
      fuelCost: 77.1,
      fuelCostChange: 3,
      totalDistance: 24060,
      totalDistanceChange: 12,
      avgEfficiency: 8.2,
      efficiencyLabel: "Tốt",
    },
    costByMonth: [
      { label: "Th1", totalPercent: 70, fuelPercent: 55 },
      { label: "Th2", totalPercent: 65, fuelPercent: 50 },
      { label: "Th3", totalPercent: 80, fuelPercent: 60 },
      { label: "Th4", totalPercent: 60, fuelPercent: 45 },
      { label: "Th5", totalPercent: 78, fuelPercent: 58 },
      { label: "Th6", totalPercent: 68, fuelPercent: 52 },
    ],
    costDistribution: [
      { label: "Nhiên liệu", percent: 60, value: 77.1 },
      { label: "Bảo trì", percent: 25, value: 32.1 },
      { label: "Lương tài xế", percent: 10, value: 12.8 },
      { label: "Khác", percent: 5, value: 6.5 },
    ],
    vehiclePerformance: [
      { plate: "29A-12345", trips: 45, distance: 5400, efficiency: 8.5, rating: 4.8, rank: "#1" },
      { plate: "30B-98765", trips: 42, distance: 5100, efficiency: 8.2, rating: 4.9, rank: "#2" },
      { plate: "51F-11111", trips: 38, distance: 4560, efficiency: 7.8, rating: 4.7, rank: "#3" },
      { plate: "29A-54321", trips: 35, distance: 4200, efficiency: 8.0, rating: 4.6, rank: "#4" },
      { plate: "30D-33333", trips: 40, distance: 4800, efficiency: 8.3, rating: 4.8, rank: "#5" },
    ],
    fleetStatus: [
      { statusKey: "active", label: "Đang hoạt động", count: 35, percent: 70 },
      { statusKey: "maintenance", label: "Đang bảo trì", count: 8, percent: 16 },
      { statusKey: "broken", label: "Hỏng / Không hoạt động", count: 3, percent: 6 },
      { statusKey: "business", label: "Đang đi công tác", count: 28, percent: 56 },
      { statusKey: "soon", label: "Sắp đến hạn bảo dưỡng", count: 5, percent: 10 },
    ],
    todayStats: [
      { label: "Tổng km đã chạy", valueText: "1,245 km", percent: 75 },
      { label: "Chi phí nhiên liệu hôm nay", valueText: "4.2M VNĐ", percent: 65 },
      { label: "Số chuyến hoàn thành", valueText: "28 / 35 chuyến", percent: 80 },
      { label: "Tài xế đang hoạt động", valueText: "32 / 72 tài xế", percent: 44 },
    ],
  };

  // Nếu muốn thay đổi chút theo period cho sinh động
  if (period === "last_month") {
    return {
      ...base,
      summary: {
        ...base.summary,
        totalCost: 140.2,
        totalCostChange: 5,
      },
    };
  }

  if (period === "this_quarter") {
    return {
      ...base,
      summary: {
        ...base.summary,
        totalCost: 380.5,
        totalDistance: 68000,
      },
    };
  }

  return base;
}
