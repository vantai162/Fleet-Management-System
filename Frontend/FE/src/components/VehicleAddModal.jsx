import React, { useState, useEffect } from "react";
import CustomSelect from "./CustomSelect";
import "./VehicleAddModal.css";

export default function VehicleAddModal({ onClose, onSubmit, vehicle = null }) {
  const [form, setForm] = useState({
    plate: "",
    type: "Xe tải nhỏ",
    brand: "",
    model: "",
    year: 2024,
    capacity: "",
    km: 0,
    fuelType: "Dầu",
    status: "Sẵn sàng",
    lastMaintenance: "",
    nextMaintenance: "",
  });

  useEffect(() => {
    if (vehicle) {
      setForm({
        plate: vehicle.plate || vehicle.plateNumber || "",
        type: vehicle.type || "Xe tải nhỏ",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        capacity: vehicle.capacity || "",
        km:
          typeof vehicle.km === "string" && vehicle.km.includes("km")
            ? Number(String(vehicle.km).replace(/[^\d]/g, "")) || 0
            : vehicle.km || 0,
        fuelType: vehicle.fuelType || "Dầu",
        status: vehicle.status || "Sẵn sàng",
        lastMaintenance: vehicle.lastMaintenance || "",
        nextMaintenance: vehicle.nextMaintenance || "",
      });
    }
  }, [vehicle]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    const requiredFields = [
      "plate",
      "type",
      "brand",
      "model",
      "year",
      "capacity",
      "km",
      "fuelType",
      "status",
    ];

    const missing = requiredFields.filter((key) => {
      const val = form[key];
      if (val === null || val === undefined) return true;
      if (typeof val === "string") return val.trim() === "";
      return val === "";
    });

    if (missing.length > 0) {
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
      return;
    }

    // basic numeric checks
    if (isNaN(Number(form.year)) || Number(form.year) <= 1900) {
      setError("Vui lòng nhập năm sản xuất hợp lệ.");
      return;
    }
    if (isNaN(Number(form.km)) || Number(form.km) < 0) {
      setError("Vui lòng nhập số km hợp lệ.");
      return;
    }

    const payload = { ...form };
    if (vehicle && vehicle.id) payload.id = vehicle.id;
    if (onSubmit) onSubmit(payload);
  };

  return (
    <div className="vehicle-modal-overlay">
      <div className="vehicle-modal-container">
        <h2 className="vehicle-modal-title">
          {vehicle ? "Cập nhật phương tiện" : "Thêm phương tiện mới"}
        </h2>

        <div className="vehicle-modal-grid">
          <div className="vehicle-modal-field">
            <label>Biển số xe</label>
            <input
              type="text"
              value={form.plate}
              onChange={(e) => update("plate", e.target.value)}
              placeholder="29A-12345"
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Loại xe</label>
            <CustomSelect
              value={form.type}
              onChange={(value) => update("type", value)}
              options={[
                { value: "Xe tải nhỏ", label: "Xe tải nhỏ" },
                { value: "Xe tải lớn", label: "Xe tải lớn" },
                { value: "Xe container", label: "Xe container" },
                { value: "Xe khách", label: "Xe khách" },
                { value: "Xe bán tải", label: "Xe bán tải" },
                { value: "Xe con", label: "Xe con" },
              ]}
              placeholder="Chọn loại xe"
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Hãng xe</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              placeholder="VD: Hino, Hyundai, Ford..."
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Model</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              placeholder="Hino 500"
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Năm sản xuất</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            />
          </div>
          <div className="vehicle-modal-field">
            <label>Tải trọng</label>
            <input
              type="text"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              placeholder="VD: 5 tấn, 10 tấn, 40 chỗ..."
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Trạng thái</label>
            <CustomSelect
              value={form.status}
              onChange={(value) => update("status", value)}
              options={[
                { value: "Sẵn sàng", label: "Sẵn sàng" },
                { value: "Đang dùng", label: "Đang dùng" },
                { value: "Bảo trì", label: "Bảo trì" },
              ]}
              placeholder="Chọn trạng thái"
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Km đã chạy</label>
            <input
              type="number"
              min="0"
              value={form.km}
              onChange={(e) => update("km", e.target.value)}
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Loại nhiên liệu</label>
            <CustomSelect
              value={form.fuelType}
              onChange={(value) => update("fuelType", value)}
              options={[
                { value: "Dầu", label: "Dầu" },
                { value: "Xăng", label: "Xăng" },
                { value: "Điện", label: "Điện" },
                { value: "Hybrid", label: "Hybrid" },
              ]}
              placeholder="Chọn loại nhiên liệu"
            />
          </div>

          <div className="vehicle-modal-field">
            <label>Bảo trì lần cuối (tùy chọn)</label>
            <input
              type="date"
              value={form.lastMaintenance}
              onChange={(e) => update("lastMaintenance", e.target.value)}
            />
          </div>

          <div className="vehicle-modal-field vehicle-modal-field--full">
            <label>Bảo trì tiếp theo (tùy chọn)</label>
            <input
              type="text"
              value={form.nextMaintenance}
              onChange={(e) => update("nextMaintenance", e.target.value)}
              placeholder="mm/dd/yyyy"
            />
          </div>
        </div>
        {error ? (
          <div className="vehicle-modal-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="vehicle-modal-actions">
          <button className="vehicle-modal-cancel" onClick={onClose}>
            Hủy
          </button>

          <button className="vehicle-modal-submit" onClick={handleSubmit}>
            {vehicle ? "Cập nhật" : "Thêm phương tiện"}
          </button>
        </div>
      </div>
    </div>
  );
}
