import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
} from "lucide-react";
import "./AccountManagement.css";
import userAPI from "../../services/userAPI";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "staff",
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // Try API first (admin must be authenticated)
    try {
      const resp = await userAPI.getAllUsers({ pageNumber: 1, pageSize: 1000 });
      const list = resp.objects || resp.items || resp || [];
      const normalized = Array.isArray(list) ? list : [];
      setUsers(normalized);
      // cache a copy locally for offline/dev convenience
      try {
        localStorage.setItem("fms_users", JSON.stringify(normalized));
      } catch {}
      return;
    } catch (err) {
      console.warn("User API failed, falling back to localStorage:", err);
    }

    // Fallback to localStorage if API call fails
    const data = localStorage.getItem("fms_users");
    if (data) {
      try {
        setUsers(JSON.parse(data));
      } catch {
        setUsers([]);
      }
    } else {
      setUsers([]);
    }
  };

  const saveUsers = (next) => {
    setUsers(next);
    localStorage.setItem("fms_users", JSON.stringify(next));
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((u) => {
        const username = (u.username || "").toLowerCase();
        const fullName = (u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = u.phone || "";
        return (
          username.includes(q) ||
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(searchTerm)
        );
      });
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    return filtered;
  }, [users, searchTerm, filterRole]);

  const handleAdd = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      username: "",
      password: "",
      role: "staff",
      fullName: "",
      email: "",
      phone: "",
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      username: user.username || "",
      password: "",
      role: user.role || "staff",
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.username || !formData.fullName || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!editingUser && !formData.password) {
      alert("Vui lòng nhập mật khẩu cho tài khoản mới");
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: formData.username,
              ...(formData.password ? { password: formData.password } : {}),
              role: formData.role,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            }
          : u
      );
      saveUsers(updated);
    } else {
      const newUser = {
        id: "u" + Date.now(),
        username: formData.username,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      saveUsers([...users, newUser]);
    }

    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      role: "staff",
      fullName: "",
      email: "",
      phone: "",
    });
  };

  const handleDelete = (id) => {
    const currentUser = JSON.parse(
      localStorage.getItem("fms.currentUser") || "{}"
    );
    if (currentUser?.id === id) {
      alert("Không thể xóa tài khoản đang đăng nhập");
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      saveUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleResetPassword = (user) => {
    const newPassword = prompt("Nhập mật khẩu mới:");
    if (newPassword) {
      const updated = users.map((u) =>
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      saveUsers(updated);
      alert("Đã reset mật khẩu thành công");
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "staff":
        return "Nhân viên";
      case "driver":
        return "Tài xế";
      default:
        return role;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "admin":
        return "am-badge am-badge--admin";
      case "staff":
        return "am-badge am-badge--staff";
      case "driver":
        return "am-badge am-badge--driver";
      default:
        return "am-badge";
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const driverCount = users.filter((u) => u.role === "driver").length;

  return (
    <div className="am">
      <div className="am-card am-header">
        <div className="am-header__left">
          <UserCircle className="am-header__icon" />
          <div>
            <h1 className="am-title">Quản lý tài khoản</h1>
            <p className="am-subtitle">Tổng số: {users.length} tài khoản</p>
          </div>
        </div>

        <button className="am-btn am-btn--primary" onClick={handleAdd}>
          <Plus className="am-btn__icon" />
          Thêm tài khoản
        </button>
      </div>

      <div className="am-stats">
        <div className="am-card am-stat">
          <div className="am-stat__label">Quản trị viên</div>
          <div className="am-stat__value am-stat__value--admin">
            {adminCount}
          </div>
        </div>
        <div className="am-card am-stat">
          <div className="am-stat__label">Nhân viên</div>
          <div className="am-stat__value am-stat__value--staff">{staffCount}</div>
        </div>
        <div className="am-card am-stat">
          <div className="am-stat__label">Tài xế</div>
          <div className="am-stat__value am-stat__value--driver">
            {driverCount}
          </div>
        </div>
      </div>

      <div className="am-card am-filters">
        <div className="am-filters__head">
          <Filter className="am-filters__icon" />
          <h2 className="am-section-title">Bộ lọc</h2>
        </div>

        <div className="am-filters__grid">
          <div className="am-inputWrap">
            <Search className="am-inputIcon" />
            <input
              className="am-input am-input--pl"
              type="text"
              placeholder="Tìm kiếm tên, username, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="am-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="staff">Nhân viên</option>
            <option value="driver">Tài xế</option>
          </select>
        </div>
      </div>

      <div className="am-card am-tableCard">
        <div className="am-tableScroll">
          <table className="am-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Họ tên</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id ?? user.userID ?? `user-${idx}`}>
                  <td>
                    <div className="am-userCell">
                      <div className="am-avatar" aria-hidden="true">
                        {(user.fullName || "?").charAt(0)}
                      </div>
                      <div>
                        <div className="am-username">{user.username}</div>
                        <div className="am-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>

                  <td>{user.fullName}</td>

                  <td>
                    <div className="am-contact">
                      <div>{user.email}</div>
                      <div className="am-muted">{user.phone}</div>
                    </div>
                  </td>

                  <td>
                    <span className={getRoleClass(user.role)}>
                      <Shield className="am-badge__icon" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  <td>
                    <div className="am-actions">
                      <button
                        className="am-iconBtn am-iconBtn--blue"
                        onClick={() => handleEdit(user)}
                        title="Chỉnh sửa"
                      >
                        <Edit2 />
                      </button>

                      <button
                        className="am-iconBtn am-iconBtn--orange"
                        onClick={() => handleResetPassword(user)}
                        title="Reset mật khẩu"
                      >
                        <KeyRound />
                      </button>

                      <button
                        className="am-iconBtn am-iconBtn--red"
                        onClick={() => handleDelete(user.id)}
                        title="Xóa"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="am-empty">
                    Không có tài khoản phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="am-modalOverlay" onMouseDown={() => setShowModal(false)}>
          <div className="am-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="am-modal__head">
              <h2 className="am-modal__title">
                {editingUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
              </h2>
            </div>

            <div className="am-modal__body">
              <div className="am-grid2">
                <div className="am-field">
                  <label>
                    Username <span className="am-required">*</span>
                  </label>
                  <input
                    className="am-input"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="username"
                  />
                </div>

                <div className="am-field">
                  <label>
                    Mật khẩu{" "}
                    {!editingUser && <span className="am-required">*</span>}{" "}
                    {editingUser && (
                      <span className="am-hint">(Để trống nếu không đổi)</span>
                    )}
                  </label>

                  <div className="am-passWrap">
                    <input
                      className="am-input am-input--pr"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="am-eyeBtn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="am-field">
                <label>
                  Họ và tên <span className="am-required">*</span>
                </label>
                <input
                  className="am-input"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="am-grid2">
                <div className="am-field">
                  <label>
                    Email <span className="am-required">*</span>
                  </label>
                  <input
                    className="am-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>

                <div className="am-field">
                  <label>Số điện thoại</label>
                  <input
                    className="am-input"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="am-field">
                <label>
                  Vai trò <span className="am-required">*</span>
                </label>
                <select
                  className="am-select"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="staff">Nhân viên</option>
                  <option value="driver">Tài xế</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="am-modal__foot">
              <button className="am-btn" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="am-btn am-btn--primary" onClick={handleSave}>
                {editingUser ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


