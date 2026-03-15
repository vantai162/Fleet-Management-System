import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./DriverEditModal.css";
import { getDriverDetails, updateDriver } from "../services/driverAPI";

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

const driverStatusOptions = [
  { value: "available", label: "Sẵn sàng" },
  { value: "on_trip", label: "Đang chạy" },
  { value: "offline", label: "Offline" },
];

const emptyLicense = () => ({
  licenseClassId: "",
  expiryDate: "",
});

const formatDateInput = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const mapLicenseLabelToId = (label) => {
  if (!label) return "";
  const normalized = label.replace(/^Bằng\s*/i, "").trim();
  const match = licenseOptions.find(
    (option) => option.label.toLowerCase() === normalized.toLowerCase()
  );
  return match ? match.value : "";
};

export default function DriverEditModal({ driverId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    birthPlace: "",
    birthDate: "",
    gplx: "",
    driverStatus: "",
    experienceYears: "",
    licenses: [emptyLicense()],
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDriverDetails();
  }, [driverId]);

  const loadDriverDetails = async () => {
    try {
      setLoading(true);
      const data = await getDriverDetails(driverId);

      const rawLicenses =
        data.licenses ||
        data.Licenses ||
        data.driverLicenses ||
        data.DriverLicenses ||
        [];

      const normalizedLicenses = Array.isArray(rawLicenses)
        ? rawLicenses
            .map((license) => {
              if (!license) return null;
              if (typeof license === "string") {
                return {
                  licenseClassId: mapLicenseLabelToId(license),
                  expiryDate: "",
                };
              }
              const classId =
                license.licenseClassId ||
                license.licenseClassID ||
                license.LicenseClassId ||
                license.LicenseClassID ||
                "";
              const expiry =
                license.expiryDate || license.ExpiryDate || license.expireDate || "";
              return {
                licenseClassId: classId ? Number(classId) : "",
                expiryDate: formatDateInput(expiry),
              };
            })
            .filter(Boolean)
        : [];

      setFormData({
        fullName: data.fullName || data.FullName || "",
        phone: data.phone || data.Phone || "",
        email: data.email || data.Email || "",
        birthPlace: data.birthPlace || data.BirthPlace || "",
        birthDate: formatDateInput(data.birthDate || data.BirthDate || ""),
        gplx: data.gplx || data.GPLX || "",
        driverStatus: data.driverStatus || data.DriverStatus || "",
        experienceYears: data.experienceYears || data.ExperienceYears || "",
        licenses: normalizedLicenses.length ? normalizedLicenses : [emptyLicense()],
        notes: data.notes || data.Notes || "",
      });
      setError(null);
    } catch (err) {
      console.error("Error loading driver details:", err);
      setError("Không thể tải thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateLicense = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLicense = () =>
    setFormData((prev) => ({
      ...prev,
      licenses: [...prev.licenses, emptyLicense()],
    }));

  const removeLicense = (index) =>
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, idx) => idx !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const hasLicenses = formData.licenses.some(
      (license) => license.licenseClassId || license.expiryDate
    );
    if (hasLicenses) {
      const invalidLicense = formData.licenses.some(
        (license) => !license.licenseClassId || !license.expiryDate
      );
      if (invalidLicense) {
        setError("Vui lòng nhập đầy đủ thông tin bằng lái.");
        return;
      }
      if (!formData.gplx.trim()) {
        setError("Vui lòng nhập số GPLX.");
        return;
      }
    }

    const payload = {
      FullName: formData.fullName.trim(),
      Phone: formData.phone.trim(),
      Email: formData.email.trim(),
      BirthPlace: formData.birthPlace.trim(),
      ExperienceYears: Number(formData.experienceYears) || 0,
      DriverStatus: formData.driverStatus,
      GPLX: formData.gplx.trim(),
    };

    if (formData.birthDate) {
      payload.BirthDate = formData.birthDate;
    }

    if (hasLicenses) {
      payload.Licenses = formData.licenses.map((license) => ({
        LicenseClassID: Number(license.licenseClassId),
        ExpiryDate: license.expiryDate,
      }));
    }

    if (formData.notes.trim()) {
      payload.Notes = formData.notes.trim();
    }

    try {
      setSaving(true);
      await updateDriver(driverId, payload);
      onSave();
    } catch (err) {
      console.error("Error updating driver:", err);
      setError("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="de-modal-overlay" onClick={onClose}>
      <div className="de-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="de-modal-header">
          <h2>Chỉnh sửa tài xế</h2>
          <button className="de-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="de-modal-body">
            {loading ? (
              <div className="de-loading">
                <div className="line-spinner"></div>
              </div>
            ) : error ? (
              <div className="de-error">{error}</div>
            ) : (
              <>
                <div className="de-form-row">
                  <div className="de-form-group">
                    <label>Họ tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="de-form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="de-form-row">
                  <div className="de-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="de-form-group">
                    <label>Trạng thái *</label>
                    <select
                      name="driverStatus"
                      value={formData.driverStatus}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn trạng thái</option>
                      {driverStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="de-form-row">
                  <div className="de-form-group">
                    <label>Nơi sinh</label>
                    <input
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="de-form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="de-form-row">
                  <div className="de-form-group">
                    <label>Số GPLX</label>
                    <input
                      type="text"
                      name="gplx"
                      value={formData.gplx}
                      onChange={handleChange}
                      placeholder="VD: 0123456789"
                    />
                  </div>
                  <div className="de-form-group">
                    <label>Kinh nghiệm (năm)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="de-form-group">
                  <label>Bằng lái</label>
                  <div className="de-license-list">
                    {formData.licenses.map((license, index) => (
                      <div key={`license-${index}`} className="de-license-row">
                        <select
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
                          type="date"
                          value={license.expiryDate}
                          onChange={(event) =>
                            updateLicense(index, "expiryDate", event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="de-license-remove"
                          onClick={() => removeLicense(index)}
                          disabled={formData.licenses.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="de-license-add" onClick={addLicense}>
                    + Thêm bằng
                  </button>
                </div>

                <div className="de-form-group">
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

          <div className="de-modal-footer">
            <button type="button" className="de-btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="de-btn-submit"
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
