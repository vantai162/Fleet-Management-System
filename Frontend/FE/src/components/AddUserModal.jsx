import React, { useState } from "react";
import "./AddUserModal.css";

const roleOptions = [
  { value: "staff", label: "Nhân viên" },
  { value: "driver", label: "Tài xế" },
  { value: "admin", label: "Quản trị viên" },
];

const driverStatusOptions = [
  { value: "available", label: "Sẵn sàng" },
  { value: "on_trip", label: "Đang chạy" },
  { value: "offline", label: "Offline" },
];

const licenseOptions = [
  { value: 1, label: "B1" },
  { value: 2, label: "B" },
  { value: 3, label: "C1" },
  { value: 4, label: "C" },
  { value: 5, label: "D1" },
  { value: 6, label: "D2" },
  { value: 7, label: "D" },
  { value: 8, label: "BE" },
  { value: 9, label: "C1E" },
  { value: 10, label: "CE" },
  { value: 11, label: "D1E" },
  { value: 12, label: "D2E" },
  { value: 13, label: "DE" },
];

const emptyLicense = () => ({
  licenseClassId: "",
  expiryDate: "",
});

export default function AddUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    password: "",
    fullName: "",
    email: "",
    phone: "",
    birthPlace: "",
    birthDate: "",
    role: "staff",
    gplx: "",
    experienceYears: 0,
    driverStatus: "available",
    licenses: [emptyLicense()],
  });
  const [error, setError] = useState("");

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateLicense = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      licenses: prev.licenses.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLicense = () =>
    setForm((prev) => ({
      ...prev,
      licenses: [...prev.licenses, emptyLicense()],
    }));

  const removeLicense = (index) =>
    setForm((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, idx) => idx !== index),
    }));

  const isDriver = form.role === "driver";
  const modalTitle = isDriver ? "Thêm tài xế mới" : "Thêm tài khoản mới";
  const submitLabel = isDriver ? "Thêm tài xế" : "Thêm tài khoản";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.password.trim() ||
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.birthPlace.trim() ||
      !form.birthDate
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    if (isDriver) {
      if (!form.licenses.length) {
        setError("Vui lòng thêm ít nhất một bằng lái.");
        return;
      }

      if (!form.gplx.trim()) {
        setError("Vui lòng nhập số GPLX.");
        return;
      }

      const invalidLicense = form.licenses.some(
        (license) => !license.licenseClassId || !license.expiryDate
      );

      if (invalidLicense) {
        setError("Vui lòng nhập đầy đủ thông tin bằng lái.");
        return;
      }
    }

    if (onSave) {
      onSave({
        password: form.password,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        birthPlace: form.birthPlace.trim(),
        birthDate: form.birthDate,
        role: form.role,
        experienceYears: Number(form.experienceYears) || 0,
        driverStatus: form.driverStatus,
        driverLicense: isDriver
          ? {
              gplx: form.gplx.trim(),
              licenses: form.licenses.map((license) => ({
                licenseClassId: Number(license.licenseClassId),
                expiryDate: license.expiryDate,
              })),
            }
          : null,
      });
    }
  };

  return (
    <div className="user-add-overlay">
      <div className="user-add-container">
        <div className="user-add-header">
          <h3>{modalTitle}</h3>
          <button
            type="button"
            className="user-add-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <form className="user-add-form" onSubmit={handleSubmit}>
          <div className="user-add-grid two">
            <div>
              <label>
                Mật khẩu <span className="required">*</span>
              </label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label>
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                className="input"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="user-add-grid two mt-3">
            <div>
              <label>
                Họ và tên <span className="required">*</span>
              </label>
              <input
                className="input"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="user-add-grid two mt-3">
            <div>
              <label>
                Nơi sinh <span className="required">*</span>
              </label>
              <input
                className="input"
                value={form.birthPlace}
                onChange={(event) => update("birthPlace", event.target.value)}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
            <div>
              <label>
                Ngày sinh <span className="required">*</span>
              </label>
              <input
                className="input"
                type="date"
                value={form.birthDate}
                onChange={(event) => update("birthDate", event.target.value)}
              />
            </div>
          </div>

          <div className="user-add-grid mt-3">
            <div>
              <label>
                Vai trò <span className="required">*</span>
              </label>
              <select
                className="input"
                value={form.role}
                onChange={(event) => update("role", event.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isDriver && (
            <div className="user-add-driver">
              <div className="user-add-grid mt-3">
                <label>
                  Bằng lái <span className="required">*</span>
                </label>
                <div className="user-add-license-list">
                  {form.licenses.map((license, index) => (
                    <div key={`license-${index}`} className="user-add-license-row">
                      <select
                        className="input"
                        value={license.licenseClassId}
                        onChange={(event) =>
                          updateLicense(index, "licenseClassId", event.target.value)
                        }
                      >
                        <option value="">-- Loại bằng --</option>
                        {licenseOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            Bằng {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input"
                        type="date"
                        value={license.expiryDate}
                        onChange={(event) =>
                          updateLicense(index, "expiryDate", event.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="user-add-license-remove"
                        onClick={() => removeLicense(index)}
                        disabled={form.licenses.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="user-add-license-add"
                  onClick={addLicense}
                >
                  + Thêm bằng
                </button>
              </div>

              <div className="user-add-grid two mt-3">
                <div>
                  <label>
                    Số GPLX <span className="required">*</span>
                  </label>
                  <input
                    className="input"
                    value={form.gplx}
                    onChange={(event) => update("gplx", event.target.value)}
                    placeholder="VD: 0123456789"
                  />
                </div>
                <div>
                  <label>Kinh nghiệm (năm)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={(event) => update("experienceYears", event.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="user-add-grid mt-3">
                <div>
                  <label>Trạng thái</label>
                  <select
                    className="input"
                    value={form.driverStatus}
                    onChange={(event) => update("driverStatus", event.target.value)}
                  >
                    {driverStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {error && <div className="user-add-error">{error}</div>}

          <div className="user-add-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
