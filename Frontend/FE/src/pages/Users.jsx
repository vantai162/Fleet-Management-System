import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUser, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Users.css";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import UserEditModal from "../components/UserEditModal";
import AddUserModal from "../components/AddUserModal";
import driverAPI from "../services/driverAPI";
import userAPI from "../services/userAPI";

const normalizeRole = (role) => (role || "").toLowerCase();

const getRoleClass = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "role-admin";
  if (normalized === "staff") return "role-staff";
  if (normalized === "driver") return "role-driver";
  return "role-staff";
};

const formatRoleLabel = (role) => {
  const normalized = normalizeRole(role);
  const roleMap = {
    admin: "Quản trị viên",
    staff: "Nhân viên",
    driver: "Tài xế",
  };
  return roleMap[normalized] || "Nhân viên";
};

const getDepartmentClass = (department) => {
  if (!department) return "dept-default";
  const dept = department.toLowerCase();
  if (dept.includes("it") || dept.includes("công nghệ")) return "dept-it";
  if (dept.includes("operation") || dept.includes("vận hành"))
    return "dept-operations";
  if (dept.includes("logistic") || dept.includes("hậu cần"))
    return "dept-logistics";
  if (dept.includes("hr") || dept.includes("nhân sự")) return "dept-hr";
  return "dept-default";
};

const resolveUserId = (user) =>
  user?.userID ?? user?.UserID ?? user?.id ?? user?.userId ?? null;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roleOptions, setRoleOptions] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    role: "",
    keyword: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    staff: 0,
    driver: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage, pagination.pageSize, filters]);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadOptions = async () => {
    try {
      const roles = await userAPI.getUserRoles();
      setRoleOptions([{ value: "", label: "Tất cả vai trò" }, ...roles]);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  const loadUsers = async () => {
    try {
      setTableLoading(true);
      const usersData = await userAPI.getAllUsers({
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        role: filters.role,
        keyword: filters.keyword,
      });

      const usersList = usersData.objects || usersData.items || usersData || [];

      setUsers(Array.isArray(usersList) ? usersList : []);
      setPagination((prev) => ({
        ...prev,
        totalItems: usersData.total || usersList.length || 0,
        totalPages: Math.ceil(
          (usersData.total || usersList.length || 0) / prev.pageSize
        ),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setUsers([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await userAPI.getAllUsers({
        pageNumber: 1,
        pageSize: 9999,
      });

      const allUsers = data.objects || data.items || data || [];

      setStats({
        total: allUsers.length,
        admin: allUsers.filter((u) => (u.role || "").toLowerCase() === "admin")
          .length,
        staff: allUsers.filter((u) => (u.role || "").toLowerCase() === "staff")
          .length,
        driver: allUsers.filter(
          (u) => (u.role || "").toLowerCase() === "driver"
        ).length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      await loadUsers();
      await loadStats();
      toast.success("Xóa tài khoản thành công!");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Không thể xóa tài khoản. Vui lòng thử lại.");
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const userId = resolveUserId(selectedUser);
      if (!userId) {
        throw new Error("Missing user id");
      }

      await userAPI.updateUser(userId, userData);
      await loadUsers();
      await loadStats();
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success("Cập nhật tài khoản thành công!");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Không thể cập nhật tài khoản. Vui lòng thử lại.");
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      if (formData.role === "driver" && formData.driverLicense) {
        const licenses = Array.isArray(formData.driverLicense.licenses)
          ? formData.driverLicense.licenses
          : [];
        if (licenses.length === 0) {
          throw new Error("Missing license class");
        }
        await driverAPI.createDriver({
          FullName: formData.fullName,
          Phone: formData.phone,
          Email: formData.email,
          BirthPlace: formData.birthPlace,
          BirthDate: formData.birthDate,
          Password: formData.password,
          GPLX: formData.driverLicense.gplx,
          ExperienceYears: Number(formData.experienceYears) || 0,
          DriverStatus: formData.driverStatus || "available",
          Licenses: licenses.map((license) => ({
            LicenseClassID: license.licenseClassId,
            ExpiryDate: license.expiryDate,
          })),
        });
      } else {
        const registerPayload = {
          FullName: formData.fullName,
          Phone: formData.phone,
          Password: formData.password,
          Email: formData.email,
          BirthPlace: formData.birthPlace,
          BirthDate: formData.birthDate,
        };

        const created = await userAPI.register(registerPayload);
        const userId = resolveUserId(created);

        if (userId) {
          const updatePayload = {
            FullName: formData.fullName,
            Email: formData.email,
            Phone: formData.phone,
            Role: formData.role,
          };
          await userAPI.updateUser(userId, updatePayload);
        }
      }

      await loadUsers();
      await loadStats();
      setShowAddModal(false);
      toast.success("Đã tạo tài khoản thành công!");
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Không thể tạo tài khoản. Vui lòng thử lại.");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  if (loading) {
    return (
      <div className="users-page">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <div className="users-header-simple">
          <div>
            <div className="users-header-title">Quản lý tài khoản</div>
            <div className="users-header-subtitle">
              Quản lý người dùng trong hệ thống
            </div>
          </div>
          <button type="button" className="users-add-btn" disabled>
            + Thêm tài khoản
          </button>
        </div>

        <div className="users-stats-row">
          <div className="user-stat user-stat-1">
            <div className="user-stat-label">Tổng số</div>
            <div className="user-stat-value">...</div>
          </div>
          <div className="user-stat user-stat-2">
            <div className="user-stat-label">Admin</div>
            <div className="user-stat-value">...</div>
          </div>
          <div className="user-stat user-stat-3">
            <div className="user-stat-label">Staff</div>
            <div className="user-stat-value">...</div>
          </div>
          <div className="user-stat user-stat-4">
            <div className="user-stat-label">Driver</div>
            <div className="user-stat-value">...</div>
          </div>
        </div>

        <div className="users-filters">
          <div className="users-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value=""
              onChange={() => {}}
              disabled
            />
          </div>
          <CustomSelect
            value=""
            onChange={() => {}}
            options={[{ value: "", label: "Tất cả vai trò" }]}
            placeholder="Tất cả vai trò"
          />
        </div>

        <div className="users-list">
          <div className="users-table-card">
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Phòng ban</th>
                    <th>Ngày đăng ký</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="line-spinner"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header-simple">
        <div>
          <div className="users-header-title">Quản lý tài khoản</div>
          <div className="users-header-subtitle">
            Quản lý người dùng trong hệ thống
          </div>
        </div>
        <button
          type="button"
          className="users-add-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Thêm tài khoản
        </button>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            background: "#fee",
            color: "#c33",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #fcc",
          }}
        >
          {error}
        </div>
      )}

      <div className="users-stats-row">
        <div className="user-stat user-stat-1">
          <div className="user-stat-label">Tổng số</div>
          <div className="user-stat-value">{stats.total}</div>
        </div>
        <div className="user-stat user-stat-2">
          <div className="user-stat-label">Admin</div>
          <div className="user-stat-value">{stats.admin}</div>
        </div>
        <div className="user-stat user-stat-3">
          <div className="user-stat-label">Staff</div>
          <div className="user-stat-value">{stats.staff}</div>
        </div>
        <div className="user-stat user-stat-4">
          <div className="user-stat-label">Driver</div>
          <div className="user-stat-value">{stats.driver}</div>
        </div>
      </div>

      <div className="users-filters">
        <div className="users-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
          />
        </div>
        <CustomSelect
          value={filters.role}
          onChange={(value) => handleFilterChange("role", value)}
          options={roleOptions}
          placeholder="Tất cả vai trò"
        />
      </div>

      <div className="users-list">
        <div className="users-table-card">
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Phòng ban</th>
                  <th>Ngày đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="line-spinner"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userID} className="users-tr">
                      <td className="users-td">
                        <div className="users-name-cell">
                          <div className="users-avatar">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.fullName} />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="users-name-text">{user.fullName}</div>
                        </div>
                      </td>
                      <td className="users-td">
                        <div className="users-email-text">{user.email}</div>
                      </td>
                      <td className="users-td">
                        <div className="users-phone-text">
                          {user.phone || "-"}
                        </div>
                      </td>
                      <td className="users-td">
                        <span
                          className={`users-role-badge ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="users-td">
                        {user.department ? (
                          <span
                            className={`users-dept-badge ${getDepartmentClass(
                              user.department
                            )}`}
                          >
                            {user.department}
                          </span>
                        ) : (
                          <span className="users-dept-text">-</span>
                        )}
                      </td>
                      <td className="users-td">
                        <div className="users-date-cell">
                          <div className="users-date-day">
                            {new Date(user.registeredAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          <div className="users-date-time">
                            {new Date(user.registeredAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="users-td users-td-actions">
                        <div className="users-actions">
                          <button
                            className="users-icon-btn users-icon-edit"
                            title="Chỉnh sửa"
                            onClick={() => handleEditUser(user)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="users-icon-btn users-icon-delete"
                            title="Xóa"
                            onClick={() => handleDeleteUser(resolveUserId(user))}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pagination.totalItems > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateUser}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
