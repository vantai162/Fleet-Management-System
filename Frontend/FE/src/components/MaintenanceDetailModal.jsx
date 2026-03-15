import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./MaintenanceDetailModal.css";
import maintenanceAPI from "../services/maintenanceAPI";

export default function MaintenanceDetailModal({ recordId, onClose }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecordDetail();
  }, [recordId]);

  const loadRecordDetail = async () => {
    try {
      setLoading(true);
      const data = await maintenanceAPI.getMaintenanceById(recordId);
      setRecord(data);
      setError(null);
    } catch (err) {
      console.error("Error loading maintenance detail:", err);
      setError("Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { text: "Đã lên lịch", class: "status-scheduled" },
      "in-progress": { text: "Đang thực hiện", class: "status-in-progress" },
      completed: { text: "Hoàn thành", class: "status-completed" },
      overdue: { text: "Quá hạn", class: "status-overdue" },
    };
    return badges[status] || badges["scheduled"];
  };

  if (loading) {
    return (
      <div className="maintenance-detail-backdrop" onClick={onClose}>
        <div
          className="maintenance-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="maintenance-detail-header">
            <h3>Chi tiết hóa đơn</h3>
            <button className="maintenance-detail-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="maintenance-detail-body">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="line-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="maintenance-detail-backdrop" onClick={onClose}>
        <div
          className="maintenance-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="maintenance-detail-header">
            <h3>Chi tiết hóa đơn</h3>
            <button className="maintenance-detail-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="maintenance-detail-body">
            <div
              style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}
            >
              {error || "Không tìm thấy thông tin"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(record.status);

  return (
    <div className="maintenance-detail-backdrop" onClick={onClose}>
      <div
        className="maintenance-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="maintenance-detail-header">
          <h3>Chi tiết hóa đơn bảo trì</h3>
          <button className="maintenance-detail-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="maintenance-detail-body">
          <div className="maintenance-detail-section">
            <div className="maintenance-detail-title">Thông tin chung</div>
            <div className="maintenance-detail-grid">
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">Mã hóa đơn:</span>
                <span className="maintenance-detail-value">
                  {record.invoiceNumber || `HD-BT-${record.id}`}
                </span>
              </div>
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">Trạng thái:</span>
                <span className={`maintenance-status-badge ${badge.class}`}>
                  {badge.text}
                </span>
              </div>
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">Phương tiện:</span>
                <span className="maintenance-detail-value">
                  {record.plateNumber || record.vehicle}
                </span>
              </div>
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">Loại bảo trì:</span>
                <span className="maintenance-detail-value">{record.type}</span>
              </div>
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">Kỹ thuật viên:</span>
                <span className="maintenance-detail-value">
                  {record.technician || record.technicianName || "-"}
                </span>
              </div>
              <div className="maintenance-detail-field">
                <span className="maintenance-detail-label">
                  Ngày thực hiện:
                </span>
                <span className="maintenance-detail-value">
                  {record.date
                    ? new Date(record.date).toLocaleDateString("vi-VN")
                    : new Date(record.scheduledDate).toLocaleDateString(
                        "vi-VN"
                      )}
                </span>
              </div>
            </div>
          </div>

          {record.description && (
            <div className="maintenance-detail-section">
              <div className="maintenance-detail-title">Mô tả</div>
              <div className="maintenance-detail-description">
                {record.description}
              </div>
            </div>
          )}

          {record.services && record.services.length > 0 && (
            <div className="maintenance-detail-section">
              <div className="maintenance-detail-title">Dịch vụ</div>
              <div className="maintenance-detail-services">
                {record.services.map((service, index) => (
                  <div key={index} className="maintenance-detail-service-item">
                    <div className="maintenance-detail-service-name">
                      {service.name}
                    </div>
                    <div className="maintenance-detail-service-price">
                      {service.price?.toLocaleString() || 0}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="maintenance-detail-section">
            <div className="maintenance-detail-total">
              <span className="maintenance-detail-total-label">Tổng tiền:</span>
              <span className="maintenance-detail-total-value">
                {record.totalAmount?.toLocaleString() || 0}đ
              </span>
            </div>
          </div>
        </div>

        <div className="maintenance-detail-footer">
          <button className="maintenance-detail-btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
