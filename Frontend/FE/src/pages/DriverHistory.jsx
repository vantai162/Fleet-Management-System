import React, { useState } from "react";
import { FaSearch, FaUser, FaStar } from "react-icons/fa";
import "./DriverHistory.css";

const mockDriverHistory = [
  {
    date: "15/12/2024",
    driver: "Phạm Văn Đức",
    avatar: "P",
    vehicle: "30B-67890",
    route: "Hà Nội - Hải Phòng",
    duration: "9h 0m",
    rating: 4.5,
  },
  {
    date: "10/12/2024",
    driver: "Phạm Văn Đức",
    avatar: "P",
    vehicle: "30B-67890",
    route: "Hà Nội - Thanh Hóa",
    duration: "12h 0m",
    rating: 4.8,
  },
];

export default function DriverHistory() {
  const [filter, setFilter] = useState("all");
  const drivers = ["Tất cả tài xế", "Phạm Văn Đức", "Nguyễn Thị Hoa", "Trần Văn Kiên"];

  const filtered = mockDriverHistory.filter(
    (h) => filter === "all" || h.driver === filter
  );

  return (
    <div className="dh-page">
      <div className="dh-header-card">
        <div className="dh-header-left">
          <div className="dh-icon"><FaUser /></div>
          <div>
            <div className="dh-title">Lịch sử lái xe</div>
            <div className="dh-sub">Theo dõi chi tiết chuyến đi của tài xế</div>
          </div>
        </div>

        <div className="dh-filter">
          <FaSearch className="dh-search-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {drivers.map((d, i) => (
              <option key={i} value={i === 0 ? "all" : d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dh-card">
        <table className="dh-table">
          <thead>
            <tr>
              <th>NGÀY</th>
              <th>TÀI XẾ</th>
              <th>XE</th>
              <th>LỘ TRÌNH</th>
              <th>KHOẢNG CÁCH</th>
              <th>THỜI GIAN</th>
              <th>ĐÁNH GIÁ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td>{r.date}</td>
                <td>
                  <div className="dh-driver-cell">
                    <div className="dh-avatar">{r.avatar}</div>
                    <div>
                      <div className="dh-driver-name">{r.driver}</div>
                    </div>
                  </div>
                </td>
                <td>{r.vehicle}</td>
                <td>{r.route}</td>
                <td className="dh-right">{r.km || r.distance || "120 km"}</td>
                <td className="dh-right">{r.duration}</td>
                <td className="dh-right">
                  <FaStar className="dh-star" /> {r.rating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


