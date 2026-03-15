import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./DriverDetailModal.css";
import { getDriverDetails, getDriverHistory } from "../services/driverAPI";

export default function DriverDetailModal({ driverId, onClose }) {
  const [driver, setDriver] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDriverData();
  }, [driverId]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const data = await getDriverDetails(driverId);
      setDriver(data);
      setError(null);

      // Load history after details
      setHistoryLoading(true);
      try {
        const historyData = await getDriverHistory(driverId);
        setHistory(
          Array.isArray(historyData) ? historyData : historyData.trips || []
        );
      } catch (histErr) {
        console.error("Error loading driver history:", histErr);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    } catch (err) {
      console.error("Error loading driver details:", err);
      setError("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dd-modal-overlay" onClick={onClose}>
      <div className="dd-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="dd-modal-header">
          <h2>Chi tiết tài xế</h2>
          <button className="dd-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="dd-modal-body">
          {loading ? (
            <div className="dd-loading">
              <div className="line-spinner"></div>
            </div>
          ) : error ? (
            <div className="dd-error">{error}</div>
          ) : driver ? (
            <>
              <div className="dd-section">
                <h3 className="dd-section-title">Thông tin cơ bản</h3>
                <div className="dd-info-grid">
                  <div className="dd-info-item">
                    <span className="dd-label">Họ tên:</span>
                    <span className="dd-value">
                      {driver.fullName || driver.FullName || "-"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Số điện thoại:</span>
                    <span className="dd-value">
                      {driver.phone || driver.Phone || "-"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Email:</span>
                    <span className="dd-value">
                      {driver.email || driver.Email || "-"}
                    </span>
                  </div>
                   <div className="dd-info-item">
                    <span className="dd-label">Nơi sinh:</span>
                    <span className="dd-value">
                      {driver.birthPlace || driver.BirthPlace || "-"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Ngày tháng năm sinh:</span>
                    <span className="dd-value">
                      {driver.birthDate || driver.BirthDate || "-"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Trạng thái:</span>
                    <span
                      className={`dd-status-badge status-${
                        driver.driverStatus || driver.DriverStatus || "unknown"
                      }`}
                    >
                      {(driver.driverStatus || driver.DriverStatus) ===
                      "available"
                        ? "Sẵn sàng"
                        : (driver.driverStatus || driver.DriverStatus) ===
                          "on_trip"
                        ? "Đang chạy"
                        : (driver.driverStatus || driver.DriverStatus) ===
                          "offline"
                        ? "Nghỉ"
                        : driver.driverStatus ||
                          driver.DriverStatus ||
                          "Không rõ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dd-section">
                <h3 className="dd-section-title">Thông tin bằng lái</h3>
                <div className="dd-info-grid">
                  <div className="dd-info-item">
                    <span className="dd-label">Loại bằng:</span>
                    <span className="dd-value">
                      {driver.licenses
                        ?.map((l) => l.licenseClass || l.licenseClassName)
                        .join(", ") ||
                        driver.Licenses?.map(
                          (l) => l.licenseClass || l.licenseClassName
                        ).join(", ") ||
                        "-"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Kinh nghiệm:</span>
                    <span className="dd-value">
                      {driver.experienceYears || driver.ExperienceYears
                        ? `${
                            driver.experienceYears || driver.ExperienceYears
                          } năm`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dd-section">
                <h3 className="dd-section-title">Thống kê</h3>
                <div className="dd-info-grid">
                  <div className="dd-info-item">
                    <span className="dd-label">Tổng số chuyến:</span>
                    <span className="dd-value">
                      {driver.totalTrips || driver.TotalTrips || 0}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">Đánh giá:</span>
                    <span className="dd-value">
                      ⭐ {(driver.rating || driver.Rating)?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <div className="dd-info-item">
                    <span className="dd-label">GPLX:</span>
                    <span className="dd-value">
                      {driver.gplx ||
                        driver.gplx ||
                        "-"}
                    </span>
                  </div>
                </div>
              </div>

              {driver.notes && (
                <div className="dd-section">
                  <h3 className="dd-section-title">Ghi chú</h3>
                  <div className="dd-notes">{driver.notes}</div>
                </div>
              )}

              <div className="dd-section">
                <h3 className="dd-section-title">Lịch sử chuyến đi</h3>
                {historyLoading ? (
                  <div className="dd-history-loading">
                    <div className="line-spinner"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="dd-no-history">Chưa có lịch sử chuyến đi</div>
                ) : (
                  <div className="dd-history-list">
                    {history.slice(0, 5).map((trip, index) => (
                      <div key={index} className="dd-history-item">
                        <div className="dd-history-row">
                          <div className="dd-history-label">Ngày:</div>
                          <div className="dd-history-value">
                            {trip.tripDate || trip.TripDate
                              ? new Date(
                                  trip.tripDate || trip.TripDate
                                ).toLocaleDateString("vi-VN")
                              : "-"}
                          </div>
                        </div>
                        <div className="dd-history-row">
                          <div className="dd-history-label">Tuyến:</div>
                          <div className="dd-history-value">
                            {trip.route || trip.Route || "-"}
                          </div>
                        </div>
                        <div className="dd-history-row">
                          <div className="dd-history-label">Phương tiện:</div>
                          <div className="dd-history-value">
                            {trip.vehiclePlate || trip.VehiclePlate || "-"}
                          </div>
                        </div>
                        <div className="dd-history-row">
                          <div className="dd-history-label">Khoảng cách:</div>
                          <div className="dd-history-value">
                            {trip.distanceKm || trip.DistanceKm
                              ? `${trip.distanceKm || trip.DistanceKm} km`
                              : "-"}
                          </div>
                        </div>
                        <div className="dd-history-row">
                          <div className="dd-history-label">Đánh giá:</div>
                          <div className="dd-history-value">
                            ⭐{" "}
                            {(trip.tripRating || trip.TripRating)?.toFixed(1) ||
                              "Chưa có"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {history.length > 5 && (
                      <div className="dd-history-more">
                        Và {history.length - 5} chuyến đi khác...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="dd-error">Không tìm thấy thông tin tài xế</div>
          )}
        </div>
      </div>
    </div>
  );
}
