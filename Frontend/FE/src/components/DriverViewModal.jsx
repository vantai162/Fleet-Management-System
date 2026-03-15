import React from "react";
import "./DriverViewModal.css";
import { FaArrowLeft, FaPhone, FaEnvelope, FaIdCard, FaTruck } from "react-icons/fa";

function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return (first + last).toUpperCase() || "D";
}

const shiftLabels = {
  morning: "Sáng",
  afternoon: "Chiều",
  night: "Tối",
  long: "Ca dài",
};

const statusLabels = {
  driving: "Đang lái",
  ready: "Sẵn sàng",
  duty: "Đang công tác",
  leave: "Nghỉ phép",
};

export default function DriverViewModal({ driver, onClose }) {
  if (!driver) return null;

  return (
    <div className="driver-view-overlay">
      <div className="driver-view-container">
        <div className="driver-view-header">
          <button className="driver-view-back" onClick={onClose}>
            <FaArrowLeft /> Quay lại
          </button>

          <div className="driver-view-header-right">
            <div className="driver-view-stars">★★★★★</div>
          </div>
        </div>

        <div className="driver-view-top">
          <div className="driver-view-avatar">{getInitials(driver.name)}</div>

          <div className="driver-view-meta">
            <h2 className="driver-view-name">{driver.name}</h2>
            <div className="driver-view-pills">
              <span className="driver-pill driver-pill-status">
                {statusLabels[driver.status] || driver.status}
              </span>
              <span className="driver-pill driver-pill-shift">
                {shiftLabels[driver.shift] || driver.shift}
              </span>
            </div>

            <div className="driver-view-contacts">
              <div><FaPhone /> {driver.phone}</div>
              <div><FaEnvelope /> {driver.email}</div>
              <div><FaIdCard /> GPLX: {driver.license || "C123456789"}</div>
              <div><FaTruck /> Xe hiện tại: 30B-67890</div>
            </div>
          </div>
        </div>

        <div className="driver-view-stats">
          <div className="driver-view-stat">
            <div className="stat-value">1</div>
            <div className="stat-label">Tổng chuyến đi</div>
          </div>
          <div className="driver-view-stat">
            <div className="stat-value">120</div>
            <div className="stat-label">Tổng km đã đi</div>
          </div>
          <div className="driver-view-stat">
            <div className="stat-value">{driver.rating}</div>
            <div className="stat-label">Đánh giá</div>
          </div>
        </div>

        <div className="driver-view-tabs">
          <div className="tabs-nav">
            <button className="tab active">Thông tin</button>
            <button className="tab">Lịch sử chuyến đi</button>
            <button className="tab">Công tác</button>
          </div>

          <div className="tab-panel">
            <div className="info-grid">
              <div>
                <div className="info-label">Họ tên đầy đủ</div>
                <div className="info-value">{driver.name}</div>

                <div className="info-label">Email</div>
                <div className="info-value">{driver.email}</div>

                <div className="info-label">Số GPLX</div>
                <div className="info-value">{driver.license || "C123456789"}</div>
              </div>

              <div>
                <div className="info-label">Số điện thoại</div>
                <div className="info-value">{driver.phone}</div>

                <div className="info-label">Loại GPLX</div>
                <div className="info-value">{(driver.licenses || []).join(", ")}</div>

                <div className="info-label">Đánh giá</div>
                <div className="info-value">{driver.rating} / 5.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


