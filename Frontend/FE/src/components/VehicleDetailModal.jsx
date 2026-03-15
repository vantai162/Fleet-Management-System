import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./VehicleDetailModal.css";
import { getVehicleDetails } from "../services/vehicleAPI";

export default function VehicleDetailModal({ vehicleId, onClose }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const data = await getVehicleDetails(vehicleId);
      setVehicle(data);
      setError(null);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
      setError("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    const status =
      vehicle.status || vehicle.vehicleStatus || vehicle.VehicleStatus || "";
    if (status === "available" || status === "Sẵn sàng") return "Sẵn sàng";
    if (status === "in_use" || status === "Đang dùng") return "Đang dùng";
    if (status === "maintenance" || status === "Bảo trì") return "Bảo trì";
    return status || "Không rõ";
  };

  const normalizeStatus = (status) => {
    return status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "_");
  };

  return (
    <div className="vd-modal-overlay" onClick={onClose}>
      <div className="vd-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vd-modal-header">
          <h2>Chi tiết phương tiện</h2>
          <button className="vd-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="vd-modal-body">
          {loading ? (
            <div className="vd-loading">
              <div className="line-spinner"></div>
            </div>
          ) : error ? (
            <div className="vd-error">{error}</div>
          ) : vehicle ? (
            <>
              <div className="vd-section">
                <h3 className="vd-section-title">Thông tin cơ bản</h3>
                <div className="vd-info-grid">
                  <div className="vd-info-item">
                    <span className="vd-label">Biển số:</span>
                    <span className="vd-value">
                      {vehicle.plateNumber ||
                        vehicle.licensePlate ||
                        vehicle.LicensePlate ||
                        "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Loại xe:</span>
                    <span className="vd-value">
                      {vehicle.type ||
                        vehicle.vehicleType ||
                        vehicle.VehicleType ||
                        "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Model:</span>
                    <span className="vd-value">
                      {vehicle.model ||
                        vehicle.vehicleModel ||
                        vehicle.VehicleModel ||
                        "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Hãng:</span>
                    <span className="vd-value">
                      {vehicle.brand ||
                        vehicle.vehicleBrand ||
                        vehicle.VehicleBrand ||
                        "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Năm sản xuất:</span>
                    <span className="vd-value">
                      {vehicle.year ||
                        vehicle.manufacturedYear ||
                        vehicle.ManufacturedYear ||
                        "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Trạng thái:</span>
                    <span
                      className={`vd-status-badge status-${normalizeStatus(
                        vehicle.status ||
                          vehicle.vehicleStatus ||
                          vehicle.VehicleStatus ||
                          "unknown"
                      )}`}
                    >
                      {getStatus()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vd-section">
                <h3 className="vd-section-title">Thông số kỹ thuật</h3>
                <div className="vd-info-grid">
                  <div className="vd-info-item">
                    <span className="vd-label">Loại nhiên liệu:</span>
                    <span className="vd-value">
                      {vehicle.fuelType || vehicle.FuelType || "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Sức chứa:</span>
                    <span className="vd-value">
                      {vehicle.capacity || vehicle.Capacity || "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Số km đã chạy:</span>
                    <span className="vd-value">
                      {(vehicle.mileage !== undefined &&
                        vehicle.mileage !== null) ||
                      (vehicle.Mileage !== undefined &&
                        vehicle.Mileage !== null)
                        ? `${(
                            vehicle.mileage ?? vehicle.Mileage
                          ).toLocaleString()} km`
                        : "-"}
                    </span>
                  </div>
                  <div className="vd-info-item">
                    <span className="vd-label">Loại bằng lái tối thiểu yêu cầu:</span>
                    <span className="vd-value">
                      {vehicle.requiredLicense || vehicle.requiredLicense
                        || vehicle.RequiredLicense || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {(vehicle.notes || vehicle.Notes) && (
                <div className="vd-section">
                  <h3 className="vd-section-title">Ghi chú</h3>
                  <div className="vd-notes">
                    {vehicle.notes || vehicle.Notes}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="vd-error">Không tìm thấy thông tin phương tiện</div>
          )}
        </div>
      </div>
    </div>
  );
}
