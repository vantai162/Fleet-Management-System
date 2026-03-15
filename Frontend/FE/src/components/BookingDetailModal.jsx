import React, { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaClock, FaUser, FaCar } from "react-icons/fa";
import "./BookingDetailModal.css";
import { API_CONFIG } from "../config/api";

export default function BookingDetailModal({ bookingId, onClose }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/booked?pageNumber=1&pageSize=9999`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin đặt trước");
      }

      const data = await response.json();
      const bookingsList = data.objects || data.items || data || [];
      const foundBooking = bookingsList.find((b) => b.tripID === bookingId);

      if (!foundBooking) {
        throw new Error("Không tìm thấy thông tin đặt trước");
      }

      setBooking(foundBooking);
      setError(null);
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString;
  };

  return (
    <div className="booking-detail-modal-overlay" onClick={onClose}>
      <div className="booking-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="booking-detail-modal-header">
          <h2 className="booking-detail-modal-title">
            {`Chi tiết đặt trước #${bookingId}`}
          </h2>
          <button className="booking-detail-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="booking-detail-modal-body">
          {loading ? (
            <div className="booking-detail-loading">
              <div className="line-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : error ? (
            <div className="booking-detail-error">{error}</div>
          ) : booking ? (
            <>
              <div className="booking-detail-section">
                <h3>
                  <FaUser /> Thông tin khách hàng
                </h3>
                <div className="booking-detail-grid">
                  <div className="booking-detail-item">
                    <label>Tên khách hàng:</label>
                    <span>{booking.customerName || "-"}</span>
                  </div>
                  <div className="booking-detail-item">
                    <label>Số điện thoại:</label>
                    <span>{booking.customerPhone || "-"}</span>
                  </div>
                  <div className="booking-detail-item">
                    <label>Email:</label>
                    <span>{booking.customerEmail || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h3>
                  <FaMapMarkerAlt /> Lộ trình
                </h3>
                <div className="booking-route">
                  <div className="booking-route-item">
                    <div className="route-marker pickup">Đ</div>
                    <div>
                      <div className="route-label">Điểm đón</div>
                      <div className="route-address">
                        {booking.pickupLocation || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="booking-route-item">
                    <div className="route-marker dropoff">Đ</div>
                    <div>
                      <div className="route-label">Điểm trả</div>
                      <div className="route-address">
                        {booking.dropoffLocation || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h3>
                  <FaClock /> Thời gian & Yêu cầu
                </h3>
                <div className="booking-detail-grid">
                  <div className="booking-detail-item">
                    <label>Ngày đặt lịch:</label>
                    <span>{formatDate(booking.scheduledDate)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <label>Giờ đặt lịch:</label>
                    <span>{formatTime(booking.scheduledTime)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <label>Loại xe yêu cầu:</label>
                    <span>{booking.requestedVehicleType || "-"}</span>
                  </div>
                  <div className="booking-detail-item">
                    <label>Số hành khách:</label>
                    <span>{booking.passengers || "-"}</span>
                  </div>
                  {booking.requestedCargo && (
                    <div className="booking-detail-item booking-detail-item">
                      <label>Hàng hóa:</label>
                      <span>{booking.requestedCargo}</span>
                    </div>
                  )}
                  <div className="booking-detail-item">
                    <label>Số km ước tính:</label>
                    <span>{booking.estimatedDistanceKm || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h3>
                  <FaCar /> Phân công
                </h3>
                {booking.assignedVehiclePlate ? (
                  <div className="booking-detail-grid">
                    <div className="booking-detail-item">
                      <label>Phương tiện:</label>
                      <span className="assigned-vehicle">
                        {booking.assignedVehiclePlate}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <label>Tài xế:</label>
                      <span className="assigned-driver">
                        {booking.assignedDriverName || "-"}
                      </span>
                    </div>
                    <div className="booking-detail-item booking-detail-item--full">
                      <label>Trạng thái:</label>
                      <span className="status-badge status-assigned">
                        Đã phân công
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="booking-not-assigned-box">
                    <span className="status-badge status-not-assigned">
                      Chưa phân công
                    </span>
                    <p className="not-assigned-note">
                      Chuyến đi chưa được phân công phương tiện và tài xế
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="booking-detail-error">Không tìm thấy thông tin</div>
          )}
        </div>

        <div className="booking-detail-modal-footer">
          <button className="booking-ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
