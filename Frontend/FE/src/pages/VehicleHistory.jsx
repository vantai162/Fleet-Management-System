import React, { useState } from "react";
import { FaSearch, FaTruck, FaCalendarAlt } from "react-icons/fa";
import "./VehicleHistory.css";

const mockHistory = [
  { date: "15/12/2024", vehicle: "30B-67890", type: "Chuyến đi", desc: "Hà Nội - Hải Phòng", driver: "Phạm Văn Đức", km: "120 km" },
  { date: "20/10/2024", vehicle: "30B-67890", type: "Bảo trì", desc: "Thay phanh và lốp xe", driver: "N/A", km: "4,200,000đ" },
  { date: "15/9/2024", vehicle: "30B-67890", type: "Thay đổi tài xế", desc: "Phân công tài xế mới", driver: "Phạm Văn Đức", km: "-" },
];

export default function VehicleHistory() {
  const [filter, setFilter] = useState("all");
  const vehicles = ["Tất cả xe", "29A-12345", "30B-67890", "51C-11111"];

  const filtered = mockHistory.filter((h) => filter === "all" || h.vehicle === filter);

  return (
    <div className="vh-page">
      <div className="vh-header-card">
        <div className="vh-header-left">
          <div className="vh-icon"><FaTruck /></div>
          <div>
            <div className="vh-title">Lịch sử phương tiện</div>
            <div className="vh-sub">Theo dõi chi tiết hoạt động của xe</div>
          </div>
        </div>
        <div className="vh-actions">
          <div className="vh-filter">
            <FaSearch className="vh-search-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {vehicles.map((v, i) => <option key={i} value={i===0 ? "all" : v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="vh-card">
        <table className="vh-table">
          <thead>
            <tr>
              <th>NGÀY</th>
              <th>XE</th>
              <th>LOẠI HOẠT ĐỘNG</th>
              <th>MÔ TẢ</th>
              <th>TÀI XẾ</th>
              <th>KM/CHI PHÍ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td>{r.date}</td>
                <td>
                  <div className="vh-plate">{r.vehicle}</div>
                  <div className="vh-plate-sub">Xe tải lớn</div>
                </td>
                <td><span className={`vh-type vh-type-${r.type.replace(/\s+/g,'').toLowerCase()}`}>{r.type}</span></td>
                <td>{r.desc}</td>
                <td>{r.driver}</td>
                <td className="vh-right">{r.km}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


