import React, { useState, useEffect } from "react";
import "./DriverAddModal.css";
import CustomSelect from "./CustomSelect";

const LICENSE_OPTIONS = [
  "Bằng B1",
  "Bằng B",
  "Bằng C1",
  "Bằng C",
  "Bằng D1",
  "Bằng D2",
  "Bằng D",
  "Bằng BE",
  "Bằng C1E",
  "Bằng CE",
  "Bằng D1E",
  "Bằng D2E",
  "Bằng DE",
];

export default function DriverAddModal({ onClose, onSubmit, driver = null }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gplx: "",
    licenseTypes: [],
    shift: "Ca sáng",
    expYears: 0,
    rating: 5,
    status: "Sẵn sàng",
  });
  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name || "",
        phone: driver.phone || "",
        email: driver.email || "",
        gplx: driver.gplx || driver.license || "",
        licenseTypes: driver.licenses || [],
        shift: driver.shift || "Ca sáng",
        expYears: driver.expYears || 0,
        rating: driver.rating || 5,
        status: driver.status || "Sẵn sàng",
      });
    } else {
      // reset
      setForm({
        name: "",
        phone: "",
        email: "",
        gplx: "",
        licenseTypes: [],
        shift: "Ca sáng",
        expYears: 0,
        rating: 5,
        status: "Sẵn sàng",
      });
    }
  }, [driver]);

  const toggleLicense = (label) => {
    setForm((prev) => {
      const has = prev.licenseTypes.includes(label);
      return {
        ...prev,
        licenseTypes: has
          ? prev.licenseTypes.filter((l) => l !== label)
          : [...prev.licenseTypes, label],
      };
    });
  };

  const handleSubmit = () => {
    setError("");
    // required: name, phone, gplx, at least one license
    if (!form.name.trim() || !form.phone.trim() || !form.gplx.trim()) {
      setError("Vui lòng điền Họ và tên, Số điện thoại và Số GPLX.");
      return;
    }
    if (form.licenseTypes.length === 0) {
      setError("Vui lòng chọn ít nhất một loại bằng lái.");
      return;
    }

    const payload = { ...form };
    if (driver && driver.id) payload.id = driver.id;
    if (onSubmit) onSubmit(payload);
  };

  return (
    <div className="driver-modal-overlay">
      <div className="driver-modal-container">
        <h2 className="driver-modal-title">
          {driver ? "Cập nhật tài xế" : "Thêm tài xế mới"}
        </h2>

        <div className="driver-modal-grid">
          <div className="driver-modal-field">
            <label>Họ và tên</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="driver-modal-field">
            <label>Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0123456789"
            />
          </div>

          <div className="driver-modal-field">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="driver-modal-field">
            <label>Số GPLX</label>
            <input
              value={form.gplx}
              onChange={(e) => update("gplx", e.target.value)}
              placeholder="VD: 012345678"
            />
          </div>

          <div className="driver-modal-field driver-modal-field--full">
            <label>Loại bằng lái</label>
            <div className="driver-license-list">
              {LICENSE_OPTIONS.map((lbl) => {
                const active = form.licenseTypes.includes(lbl);
                return (
                  <button
                    key={lbl}
                    type="button"
                    className={
                      "driver-license-chip " + (active ? "active" : "")
                    }
                    onClick={() => toggleLicense(lbl)}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="driver-modal-field">
            <label>Ca làm việc</label>
            <CustomSelect
              value={form.shift}
              onChange={(value) => update("shift", value)}
              options={[
                { value: "Ca sáng", label: "Ca sáng" },
                { value: "Ca chiều", label: "Ca chiều" },
                { value: "Ca đêm", label: "Ca đêm" },
              ]}
              placeholder="Chọn ca làm việc"
            />
          </div>

          <div className="driver-modal-field">
            <label>Kinh nghiệm (năm)</label>
            <input
              type="number"
              min="0"
              value={form.expYears}
              onChange={(e) => update("expYears", Number(e.target.value) || 0)}
            />
          </div>

          <div className="driver-modal-field">
            <label>Đánh giá (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => update("rating", Number(e.target.value) || 0)}
            />
          </div>

          <div className="driver-modal-field">
            <label>Trạng thái</label>
            <CustomSelect
              value={form.status}
              onChange={(value) => update("status", value)}
              options={[
                { value: "Sẵn sàng", label: "Sẵn sàng" },
                { value: "Đang lái", label: "Đang lái" },
                { value: "Đang công tác", label: "Đang công tác" },
                { value: "Nghỉ phép", label: "Nghỉ phép" },
              ]}
              placeholder="Chọn trạng thái"
            />
          </div>
        </div>

        {error ? (
          <div className="driver-modal-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="driver-modal-actions">
          <button className="driver-modal-cancel" onClick={onClose}>
            Hủy
          </button>

          <button className="driver-modal-submit" onClick={handleSubmit}>
            {driver ? "Cập nhật" : "Thêm tài xế"}
          </button>
        </div>
      </div>
    </div>
  );
}
