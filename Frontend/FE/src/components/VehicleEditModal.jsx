import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./VehicleEditModal.css";
import { getVehicleDetails, updateVehicle } from "../services/vehicleAPI";

export default function VehicleEditModal({ vehicleId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleBrand: "",
    manufacturedYear: "",
    vehicleStatus: "",
    fuelType: "",
    capacity: "",
    mileage: "",
    fuelConsumption: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const data = await getVehicleDetails(vehicleId);

      // Extract capacity number if it's a string like "5 tấn"
      let capacityValue = data.capacity || data.Capacity || "";
      if (typeof capacityValue === "string") {
        capacityValue = capacityValue.replace(/[^\d.]/g, "");
      }

      // Normalize status to English
      let statusValue =
        data.status || data.vehicleStatus || data.VehicleStatus || "";
      if (statusValue === "Sẵn sàng") statusValue = "available";
      else if (statusValue === "Đang dùng") statusValue = "in_use";
      else if (statusValue === "Bảo trì") statusValue = "maintenance";

      setFormData({
        licensePlate:
          data.plateNumber || data.licensePlate || data.LicensePlate || "",
        vehicleType: data.type || data.vehicleType || data.VehicleType || "",
        vehicleModel:
          data.model || data.vehicleModel || data.VehicleModel || "",
        vehicleBrand:
          data.brand || data.vehicleBrand || data.VehicleBrand || "",
        manufacturedYear:
          data.year || data.manufacturedYear || data.ManufacturedYear || "",
        vehicleStatus: statusValue,
        fuelType: data.fuelType || data.FuelType || "",
        capacity: capacityValue,
        mileage: data.mileage ?? data.Mileage ?? "",
        fuelConsumption: data.fuelConsumption || data.FuelConsumption || "",
        notes: data.notes || data.Notes || "",
      });
      setError(null);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
      setError("Không thể tải thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateVehicle(vehicleId, formData);
      onSave();
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ve-modal-overlay" onClick={onClose}>
      <div className="ve-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ve-modal-header">
          <h2>Chỉnh sửa phương tiện</h2>
          <button className="ve-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ve-modal-body">
            {loading ? (
              <div className="ve-loading">
                <div className="line-spinner"></div>
              </div>
            ) : error ? (
              <div className="ve-error">{error}</div>
            ) : (
              <>
                <div className="ve-form-row">
                  <div className="ve-form-group">
                    <label>Biển số *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="ve-form-group">
                    <label>Loại xe *</label>
                    <input
                      type="text"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="ve-form-row">
                  <div className="ve-form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ve-form-group">
                    <label>Hãng</label>
                    <input
                      type="text"
                      name="vehicleBrand"
                      value={formData.vehicleBrand}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="ve-form-row">
                  <div className="ve-form-group">
                    <label>Năm sản xuất</label>
                    <input
                      type="number"
                      name="manufacturedYear"
                      value={formData.manufacturedYear}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ve-form-group">
                    <label>Trạng thái *</label>
                    <select
                      name="vehicleStatus"
                      value={formData.vehicleStatus}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="available">Sẵn sàng</option>
                      <option value="in_use">Đang dùng</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                </div>

                <div className="ve-form-row">
                  <div className="ve-form-group">
                    <label>Loại nhiên liệu</label>
                    <input
                      type="text"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ve-form-group">
                    <label>Sức chứa (tấn)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="ve-form-row">
                  <div className="ve-form-group">
                    <label>Số km đã chạy</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ve-form-group">
                    <label>Tiêu hao nhiên liệu (L/100km)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="fuelConsumption"
                      value={formData.fuelConsumption}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="ve-form-group">
                  <label>Ghi chú</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </>
            )}
          </div>

          <div className="ve-modal-footer">
            <button type="button" className="ve-btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="ve-btn-submit"
              disabled={saving || loading}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
