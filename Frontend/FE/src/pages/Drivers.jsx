import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Drivers.css";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import DriverDetailModal from "../components/DriverDetailModal";
import DriverEditModal from "../components/DriverEditModal";
import DriverAddModal from "../components/DriverAddModal";
import ConfirmModal from "../components/ConfirmModal";
import { getDrivers, deleteDriver, createDriver } from "../services/driverAPI";
import driverAPI from "../services/driverAPI";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [deletingDriverId, setDeletingDriverId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Xác nhận");

  // Stats state - tổng thể không phụ thuộc pagination
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    onTrip: 0,
    offline: 0,
  });

  // Options state
  const [statusOptions, setStatusOptions] = useState([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    driverStatus: "",
    keyword: "",
    minRating: "",
    maxRating: "",
    minExperience: "",
    maxExperience: "",
    licenseClass: "",
  });

  // Load drivers from API
  useEffect(() => {
    loadDrivers();
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Load stats once on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const statuses = await driverAPI.getDriverStatuses();
      setStatusOptions([
        { value: "", label: "Tất cả trạng thái" },
        ...statuses,
      ]);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  const loadDrivers = async () => {
    try {
      setTableLoading(true);

      const params = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        driverStatus: filters.driverStatus,
      };

      // Add optional filters
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.minRating) params.minRating = Number(filters.minRating);
      if (filters.maxRating) params.maxRating = Number(filters.maxRating);
      if (filters.minExperience)
        params.minExperienceYears = Number(filters.minExperience);
      if (filters.maxExperience)
        params.maxExperienceYears = Number(filters.maxExperience);
      if (filters.licenseClass) params.licenseClass = filters.licenseClass;

      const data = await getDrivers(params);

      const driversList = data.objects || data.items || data || [];
      // normalize to array
      let normalized = Array.isArray(driversList) ? driversList : [];

      // If "All statuses" (no driverStatus filter) is selected, sort by ID ascending
      if (!filters.driverStatus) {
        normalized = normalized.slice().sort((a, b) => {
          const aId = Number(a.driverID ?? a.id ?? 0) || 0;
          const bId = Number(b.driverID ?? b.id ?? 0) || 0;
          return aId - bId;
        });
      }

      setDrivers(normalized);
      const totalCount = data.total ?? normalized.length ?? 0;
      setPagination((prev) => ({
        ...prev,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / prev.pageSize),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setDrivers([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load all drivers without pagination to get accurate stats
      const data = await getDrivers({
        pageNumber: 1,
        pageSize: 9999, // Get all
      });

      const allDrivers = data.objects || data.items || data || [];

      setStats({
        total: allDrivers.length,
        available: allDrivers.filter(
          (d) => (d.status || d.driverStatus) === "available"
        ).length,
        onTrip: allDrivers.filter(
          (d) => (d.status || d.driverStatus) === "on_trip"
        ).length,
        offline: allDrivers.filter(
          (d) => (d.status || d.driverStatus) === "offline"
        ).length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleCreateDriver = async (driverData) => {
    try {
      // Map license types to LicenseClassID (simplified mapping)
      const licenseMap = {
        "Bằng B1": 1,
        "Bằng B": 2,
        "Bằng C1": 3,
        "Bằng C": 4,
        "Bằng D1": 5,
        "Bằng D2": 6,
        "Bằng D": 7,
        "Bằng BE": 8,
        "Bằng C1E": 9,
        "Bằng CE": 10,
        "Bằng D1E": 11,
        "Bằng D2E": 12,
        "Bằng DE": 13,
      };

      // Map form data to API format
      const apiData = {
        fullName: driverData.name || "-",
        phone: driverData.phone || "-",
        // If email is empty, generate a dummy email based on phone number
        email:
          driverData.email && driverData.email.trim()
            ? driverData.email.trim()
            : `driver${driverData.phone.replace(/\D/g, "")}@fms.local`,
        birthPlace: "-",
        experienceYears: Number(driverData.expYears) || 0,
        licenses: driverData.licenseTypes.map((licenseType) => ({
          licenseClassID: licenseMap[licenseType] || 1,
          expiryDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 5)
          ).toISOString(), // Default 5 years from now
        })),
        driverStatus:
          driverData.status === "Sẵn sàng"
            ? "available"
            : driverData.status === "Đang lái"
            ? "on_trip"
            : "offline",
        password: "Driver@123", // Default password
      };

      await createDriver(apiData);
      await loadDrivers(); // Reload to get updated data
      setShowAddModal(false);
      toast.success("Thêm tài xế thành công!");
    } catch (err) {
      console.error("Error creating driver:", err);
      toast.error("Không thể thêm tài xế. Vui lòng thử lại.");
    }
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      setDeletingDriverId(driverId);
      await deleteDriver(driverId);
      // Optimistically remove from current list without full reload
      setDrivers((prev) => prev.filter((d) => d.driverID !== driverId));
      setPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - 1),
      }));
      toast.success("Xóa tài xế thành công!");
    } catch (err) {
      console.error("Error deleting driver:", err);
      toast.error("Không thể xóa tài xế. Vui lòng thử lại.");
    } finally {
      setDeletingDriverId(null);
    }
  };

  const promptDeleteDriver = (driverId) => {
    setConfirmTarget(driverId);
    setConfirmTitle("Xóa tài xế");
    setConfirmMessage("Bạn có chắc chắn muốn xóa tài xế này?");
    setConfirmOpen(true);
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
      <div className="drivers-page">
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

        <div className="drivers-header-simple">
          <div>
            <div className="drivers-header-title">Quản lý tài xế</div>
            <div className="drivers-header-subtitle">
              Quản lý thông tin và lịch trình tài xế
            </div>
          </div>
        </div>

        <div className="drivers-stats-row">
          <div className="driver-stat driver-stat-1">
            <div className="driver-stat-label">Tổng số</div>
            <div className="driver-stat-value">...</div>
          </div>
          <div className="driver-stat driver-stat-2">
            <div className="driver-stat-label">Sẵn sàng</div>
            <div className="driver-stat-value">...</div>
          </div>
          <div className="driver-stat driver-stat-3">
            <div className="driver-stat-label">Đang chạy</div>
            <div className="driver-stat-value">...</div>
          </div>
          <div className="driver-stat driver-stat-4">
            <div className="driver-stat-label">Nghỉ</div>
            <div className="driver-stat-value">...</div>
          </div>
        </div>

        <div className="drivers-filters">
          <CustomSelect
            value=""
            onChange={() => {}}
            options={[{ value: "", label: "Tất cả trạng thái" }]}
            placeholder="Tất cả trạng thái"
          />
         
        </div>

        <div className="drivers-list">
          <div className="drivers-table-card">
            <div className="drivers-table-wrap">
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th>Tài xế</th>
                    <th>Liên hệ</th>
                    <th>Bằng lái</th>
                    <th>Kinh nghiệm</th>
                    <th>Đánh giá</th>
                    <th>Trạng thái</th>
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
    <div className="drivers-page">
      <div className="drivers-header-simple">
        <div>
          <div className="drivers-header-title">Quản lý tài xế</div>
          <div className="drivers-header-subtitle">
            Quản lý thông tin và lịch trình tài xế
          </div>
        </div>
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

      <div className="drivers-stats-row">
        <div className="driver-stat driver-stat-1">
          <div className="driver-stat-label">Tổng số</div>
          <div className="driver-stat-value">{stats.total}</div>
        </div>
        <div className="driver-stat driver-stat-2">
          <div className="driver-stat-label">Sẵn sàng</div>
          <div className="driver-stat-value">{stats.available}</div>
        </div>
        <div className="driver-stat driver-stat-3">
          <div className="driver-stat-label">Đang chạy</div>
          <div className="driver-stat-value">{stats.onTrip}</div>
        </div>
        <div className="driver-stat driver-stat-4">
          <div className="driver-stat-label">Nghỉ</div>
          <div className="driver-stat-value">{stats.offline}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="drivers-filters-container">
        {/* Row 1: Search + Status */}
        <div className="drivers-filters-row">
          <div className="drivers-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm theo tên tài xế, SĐT, email..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>

          <CustomSelect
            value={filters.driverStatus}
            onChange={(value) => handleFilterChange("driverStatus", value)}
            options={statusOptions}
            placeholder="Tất cả trạng thái"
          />
        </div>

        {/* Row 2: License + Experience + Rating Min + Rating Max + Add Button */}
        <div className="drivers-filters-row">
          <CustomSelect
            value={filters.licenseClass}
            onChange={(value) => handleFilterChange("licenseClass", value)}
            options={[
              { value: "", label: "Tất cả bằng lái" },
              { value: "A1", label: "Bằng A1 - Xe mô tô ≤ 125cc" },
              { value: "A", label: "Bằng A - Xe mô tô > 125cc" },
              { value: "B1", label: "Bằng B1 - Ô tô cá nhân" },
              { value: "B", label: "Bằng B - Ô tô ≤ 9 chỗ" },
              { value: "C1", label: "Bằng C1 - Xe tải 3.5-7.5 tấn" },
              { value: "C", label: "Bằng C - Xe tải > 7.5 tấn" },
              { value: "D1", label: "Bằng D1 - Xe khách ≤ 16 chỗ" },
              { value: "D2", label: "Bằng D2 - Xe khách 17-29 chỗ" },
              { value: "D", label: "Bằng D - Xe khách ≥ 30 chỗ" },
              { value: "BE", label: "Bằng BE - Ô tô B kéo rơ-moóc" },
              { value: "C1E", label: "Bằng C1E - Xe tải C1 kéo rơ-moóc" },
              { value: "CE", label: "Bằng CE - Xe tải nặng kéo rơ-moóc" },
              { value: "D1E", label: "Bằng D1E - Xe khách nhỏ kéo rơ-moóc" },
              { value: "D2E", label: "Bằng D2E - Xe khách trung kéo rơ-moóc" },
              { value: "DE", label: "Bằng DE - Xe khách lớn kéo rơ-moóc" },
            ]}
            placeholder="Tất cả bằng lái"
          />

          <CustomSelect
            value={filters.minExperience}
            onChange={(value) => handleFilterChange("minExperience", value)}
            options={[
              { value: "", label: "Tất cả kinh nghiệm" },
              ...Array.from({ length: 50 }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} năm trở lên`,
              })),
            ]}
            placeholder="Tất cả kinh nghiệm"
          />

          <input
            type="number"
            className="drivers-filter-input"
            placeholder="Đánh giá tối thiểu"
            value={filters.minRating}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (Number(val) >= 0 && Number(val) <= 5)) {
                handleFilterChange("minRating", val);
              }
            }}
            min="0"
            max="5"
            step="0.1"
          />

          <input
            type="number"
            className="drivers-filter-input"
            placeholder="Đánh giá tối đa"
            value={filters.maxRating}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (Number(val) >= 0 && Number(val) <= 5)) {
                handleFilterChange("maxRating", val);
              }
            }}
            min="0"
            max="5"
            step="0.1"
          />

         
        </div>
      </div>

      <div className="drivers-list">
        <div className="drivers-table-card">
          <div className="drivers-table-wrap">
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>Tài xế</th>
                  <th>Liên hệ</th>
                  <th>Bằng lái</th>
                  <th>Kinh nghiệm</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
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
                ) : drivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có tài xế nào
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.driverID} className="drivers-tr">
                      <td className="drivers-td">
                        <div className="drivers-name-cell">
                          <div className="drivers-avatar">
                            {driver.avatar ? (
                              <img
                                src={driver.avatar}
                                alt={driver.name}
                                className="drivers-avatar-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/default_avt.jpg";
                                }}
                              />
                            ) : (
                              <img
                                src="/default_avt.jpg"
                                alt="Default Avatar"
                                className="drivers-avatar-img"
                              />
                            )}
                          </div>
                          <div>
                            <div
                              className="drivers-name-text"
                              title={driver.name || "-"}
                            >
                              {driver.name && driver.name.length > 25
                                ? `${driver.name.substring(0, 25)}...`
                                : driver.name || "-"}
                            </div>
                            <div className="drivers-id-text">
                              ID: {driver.driverID}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="drivers-td">
                        <div className="drivers-phone-text">
                          {driver.phone || "-"}
                        </div>
                        <div
                          className="drivers-email-text"
                          title={driver.email || "-"}
                        >
                          {driver.email && driver.email.length > 20
                            ? `${driver.email.substring(0, 20)}...`
                            : driver.email || "-"}
                        </div>
                      </td>
                      <td className="drivers-td">
                        <div className="drivers-licenses-text">
                          {driver.licenses && driver.licenses.length > 0
                            ? driver.licenses.join(", ")
                            : "-"}
                        </div>
                      </td>
                      <td className="drivers-td">
                        <div className="drivers-exp-text">
                          {driver.experienceYears || 0} năm
                        </div>
                      </td>
                      <td className="drivers-td">
                        <div className="drivers-rating-text">
                          ⭐ {driver.rating ? driver.rating.toFixed(1) : "0.0"}
                        </div>
                      </td>
                      <td className="drivers-td">
                        <span
                          className={`drivers-status-badge status-${(
                            driver.status ||
                            driver.driverStatus ||
                            "unknown"
                          )
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/đ/g, "d")
                            .replace(/\s+/g, "_")}`}
                        >
                          {(driver.status || driver.driverStatus) ===
                            "available" ||
                          (driver.status || driver.driverStatus) === "Sẵn sàng"
                            ? "Sẵn sàng"
                            : (driver.status || driver.driverStatus) ===
                                "on_trip" ||
                              (driver.status || driver.driverStatus) ===
                                "Đang chạy"
                            ? "Đang chạy"
                            : (driver.status || driver.driverStatus) ===
                                "offline" ||
                              (driver.status || driver.driverStatus) === "Nghỉ"
                            ? "Nghỉ"
                            : driver.status ||
                              driver.driverStatus ||
                              "Không rõ"}
                        </span>
                      </td>
                      <td className="drivers-td drivers-td-actions">
                        <div className="drivers-actions">
                          <button
                            className="drivers-icon-btn drivers-icon-view"
                            title="Xem chi tiết"
                            onClick={() => setSelectedDriverId(driver.driverID)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="drivers-icon-btn drivers-icon-edit"
                            title="Chỉnh sửa"
                            onClick={() => setEditingDriverId(driver.driverID)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="drivers-icon-btn drivers-icon-delete"
                            title="Xóa"
                            onClick={() => promptDeleteDriver(driver.driverID)}
                            disabled={deletingDriverId === driver.driverID}
                          >
                            {deletingDriverId === driver.driverID ? (
                              "..."
                            ) : (
                              <FaTrash />
                            )}
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

      {/* Pagination */}
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

      {selectedDriverId && (
        <DriverDetailModal
          driverId={selectedDriverId}
          onClose={() => setSelectedDriverId(null)}
        />
      )}

      {editingDriverId && (
        <DriverEditModal
          driverId={editingDriverId}
          onClose={() => setEditingDriverId(null)}
          onSave={async () => {
            setEditingDriverId(null);
            await loadDrivers();
            toast.success("Cập nhật tài xế thành công!");
          }}
        />
      )}

      {showAddModal && (
        <DriverAddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateDriver}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={() => {
          if (confirmTarget) {
            handleDeleteDriver(confirmTarget);
          }
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
      />

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
