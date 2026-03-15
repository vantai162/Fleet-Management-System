import React, { useState, useEffect } from "react";
import "./UserEditModal.css";

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

export default function UserEditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    birthPlace: "",
    birthDate: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || user.FullName || "",
        email: user.email || user.Email || "",
        phone: user.phone || user.Phone || "",
        role: user.role || user.Role || "",
        department: user.department || user.Department || "",
        birthPlace: user.birthPlace || user.BirthPlace || "",
        birthDate: formatDateInput(user.birthDate || user.BirthDate || ""),
      });
    }
  }, [user]);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const userData = {
      FullName: form.fullName.trim(),
      Email: form.email.trim(),
      Phone: form.phone.trim(),
      Role: form.role,
      Department: form.department.trim(),
      BirthPlace: form.birthPlace.trim(),
    };

    if (form.birthDate) {
      userData.BirthDate = form.birthDate;
    }

    if (onSave) onSave(userData);
  };

  return (
    <div className="user-edit-overlay">
      <div className="user-edit-container">
        <h3 className="user-edit-title">Chỉnh sửa tài khoản</h3>
        <form className="user-edit-form" onSubmit={handleSubmit}>
          <div className="grid two">
            <div>
              <label>Họ và tên *</label>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label>Số điện thoại *</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="0901234567"
              />
            </div>
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label>Vai trò</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="">-- Chọn vai trò --</option>
                <option value="admin">Quản trị viên</option>
                <option value="staff">Nhân viên</option>
                <option value="driver">Tài xế</option>
              </select>
            </div>
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Nơi sinh</label>
              <input
                className="input"
                value={form.birthPlace}
                onChange={(e) => update("birthPlace", e.target.value)}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
            <div>
              <label>Ngày sinh</label>
              <input
                className="input"
                type="date"
                value={form.birthDate}
                onChange={(e) => update("birthDate", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Phòng ban</label>
            <input
              className="input"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Nhập phòng ban"
            />
          </div>

          <div className="mt-4 actions user-edit-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
