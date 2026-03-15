import React from "react";
import "./VehicleViewModal.css";
import { FaArrowLeft, FaStar, FaTruck } from "react-icons/fa";

function vehicleTypeLabel(key) {
  switch (key) {
    case "small_truck":
      return "Xe tải nhỏ";
    case "big_truck":
      return "Xe tải lớn";
    case "container":
      return "Xe container";
    case "bus":
      return "Xe khách";
    case "pickup":
      return "Xe bán tải";
    default:
      return key;
  }
}

export default function VehicleViewModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="vehicle-view-overlay">
      <div className="vehicle-view-container">
        <div className="vehicle-view-header">
          <div className="vehicle-view-header-left">
            <button className="vehicle-view-back" onClick={onClose}>
              <FaArrowLeft /> Quay lại
            </button>
          </div>

          <div className="vehicle-view-header-right" aria-hidden>
            <div className="vehicle-view-stars" title="Rating">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>
          </div>
        </div>

        <div className="vehicle-view-main">
          <div className="vehicle-view-avatar">
            <FaTruck />
          </div>

          <div className="vehicle-view-info">
            <div className="vehicle-plate-large">{vehicle.plate}</div>
            <div className="vehicle-title-large">
              {vehicle.brand} {vehicle.model}
            </div>

            <div className="vehicle-pills">
              <span className="vehicle-pill vehicle-pill--status">Sẵn sàng</span>
              <span className="vehicle-pill vehicle-pill--type">{vehicleTypeLabel(vehicle.typeKey)}</span>
            </div>

            <div className="vehicle-meta-line">
              <div className="meta-left">
                <div className="meta-item">Năm SX: <strong>2022</strong></div>
                <div className="meta-item">Số km: <strong>{vehicle.km}</strong></div>
              </div>
              <div className="meta-right">
                <div className="meta-item">Tải trọng: <strong>{vehicle.payload}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div className="vehicle-view-stats-row">
          <div className="vehicle-stat-card">
            <div className="stat-value">1</div>
            <div className="stat-label">Tổng chuyến đi</div>
            <div className="stat-sub">1 hoàn thành</div>
          </div>
          <div className="vehicle-stat-card">
            <div className="stat-value">95</div>
            <div className="stat-label">Tổng km đã đi</div>
            <div className="stat-sub">km</div>
          </div>
          <div className="vehicle-stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Số lần bảo trì</div>
            <div className="stat-sub">lần</div>
          </div>
          <div className="vehicle-stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Chi phí bảo trì</div>
            <div className="stat-sub">VND</div>
          </div>
        </div>

        <div className="vehicle-view-tabs">
          <div className="tabs-nav">
            <button className="tab active">Thông tin</button>
            <button className="tab">Lịch sử chuyến đi</button>
            <button className="tab">Lịch sử bảo trì</button>
          </div>

          <div className="tab-panel">
            <div className="info-grid">
              <div>
                <div className="info-label">Biển số xe</div>
                <div className="info-value">{vehicle.plate}</div>

                <div className="info-label">Hãng xe</div>
                <div className="info-value">{vehicle.brand}</div>

                <div className="info-label">Năm sản xuất</div>
                <div className="info-value">2022</div>

                <div className="info-label">Số km đã đi</div>
                <div className="info-value">{vehicle.km}</div>
              </div>

              <div>
                <div className="info-label">Loại xe</div>
                <div className="info-value">{vehicleTypeLabel(vehicle.typeKey)}</div>

                <div className="info-label">Model</div>
                <div className="info-value">{vehicle.model}</div>

                <div className="info-label">Tải trọng</div>
                <div className="info-value">{vehicle.payload}</div>

                <div className="info-label">Trạng thái</div>
                <div className="info-value">Sẵn sàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


