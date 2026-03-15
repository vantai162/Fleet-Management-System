import React, { useEffect, useMemo, useState } from "react";
import {
  FaChartLine,
  FaDollarSign,
  FaGasPump,
  FaPlus,
  FaTint,
  FaTimes,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import "./FuelManagement.css";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import ConfirmModal from "../components/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_CONFIG } from "../config/api";

export default function FuelManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [records, setRecords] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    vehicleId: "",
    keyword: "",
    day: "",
    month: "",
    year: "",
    minAmount: "",
    maxAmount: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    date: new Date().toISOString().slice(0, 10),
    odometer: "",
    liters: "",
    unitPrice: "",
    station: "",
    note: "",
  });
  const [formError, setFormError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Stats state - tổng thể không phụ thuộc pagination
  const [stats, setStats] = useState({
    totalCost: 0,
    totalLiters: 0,
    count: 0,
    average: 0,
  });

  // Load vehicles and drivers on mount
  useEffect(() => {
    loadVehiclesAndDrivers();
    loadStats();
  }, []);

  // Load fuel records when filters or pagination change
  useEffect(() => {
    loadFuelRecords();
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const loadVehiclesAndDrivers = async () => {
    try {
      // Load vehicles
      const vRes = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle?pageNumber=1&pageSize=100`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );
      if (vRes.ok) {
        const vData = await vRes.json();
        const items = vData.objects || [];
        setVehicles(items);
      }

      // Load drivers
      const dRes = await fetch(
        `${API_CONFIG.BASE_URL}/Driver?pageNumber=1&pageSize=100`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );
      if (dRes.ok) {
        const dData = await dRes.json();
        const ditems = dData.objects || [];
        setDrivers(ditems);
      }
    } catch (err) {
      console.error("Error loading vehicles/drivers:", err);
    }
  };

  const loadFuelRecords = async () => {
    try {
      setTableLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("pageNumber", pagination.currentPage);
      queryParams.append("pageSize", pagination.pageSize);
      if (filters.vehicleId) queryParams.append("vehicleId", filters.vehicleId);
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.day) queryParams.append("day", filters.day);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.year) queryParams.append("year", filters.year);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount);
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/FuelRecord?${queryParams}`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const recordsList = data.objects || [];
      setRecords(recordsList);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.pageSize),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading fuel records:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setRecords([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load all fuel records without pagination to get accurate stats
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/FuelRecord?pageNumber=1&pageSize=9999`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allRecords = data.objects || [];

        const totalCost = allRecords.reduce(
          (s, r) => s + (Number(r.fuelCost) || 0),
          0
        );
        const totalLiters = allRecords.reduce(
          (s, r) => s + (Number(r.fuelAmount) || 0),
          0
        );
        const count = allRecords.length;
        const average = count ? Math.round(totalCost / count) : 0;

        setStats({
          totalCost,
          totalLiters,
          count,
          average,
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  function resetForm() {
    setForm({
      vehicleId: vehicles[0]?.vehicleID ?? "",
      date: new Date().toISOString().slice(0, 10),
      odometer: "",
      liters: "",
      unitPrice: "",
      station: "",
      note: "",
    });
    setFormError("");
  }

  function openModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    const liters = Number(form.liters);
    const unitPrice = Number(form.unitPrice);
    const odometer = form.odometer ? Number(form.odometer) : null;

    if (!form.vehicleId) return setFormError("Vui lòng chọn phương tiện.");
    if (!form.date) return setFormError("Vui lòng chọn ngày đổ xăng.");
    if (!Number.isFinite(liters) || liters <= 0)
      return setFormError("Số lít phải > 0.");
    if (!Number.isFinite(unitPrice) || unitPrice <= 0)
      return setFormError("Đơn giá phải > 0.");
    if (!Number.isFinite(odometer) || odometer <= 0)
      return setFormError("Số km phải > 0.");
    if (!form.station.trim()) return setFormError("Vui lòng nhập trạm xăng.");

    const cost = Math.round(liters * unitPrice);

    try {
      // Try to get vehicle detail to find assigned driver
      let driverId = null;
      try {
        const vRes = await fetch(
          `${API_CONFIG.BASE_URL}/Vehicle/${form.vehicleId}`,
          {
            headers: API_CONFIG.getAuthHeaders(),
          }
        );
        if (vRes.ok) {
          const vdetail = await vRes.json();
          driverId = vdetail.driverID || vdetail.DriverID || null;
        }
      } catch (err) {
        // ignore
      }

      // If no driver found, auto-pick first available driver
      if (!driverId && drivers.length > 0) {
        driverId = drivers[0].driverID;
      }

      const payload = {
        vehicleID: Number(form.vehicleId),
        driverID: driverId ? Number(driverId) : undefined,
        tripID: null,
        fuelTime: new Date(form.date).toISOString(),
        reFuelLocation: form.station.trim(),
        fuelAmount: liters,
        fuelCost: cost,
        currentKm: odometer,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/FuelRecord`, {
        method: "POST",
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await loadFuelRecords();
      setIsModalOpen(false);
      toast.success("Tạo phiếu thành công!");
    } catch (err) {
      setFormError(err.message || "Failed to create fuel record");
      toast.error(err.message || "Không thể tạo phiếu. Vui lòng thử lại.");
    }
  }

  function handleDelete(id) {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  }

  async function onConfirmDelete() {
    const id = confirmTargetId;
    setConfirmOpen(false);
    setDeletingId(id);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/FuelRecord/${id}`, {
        method: "DELETE",
        headers: API_CONFIG.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await loadFuelRecords();
      toast.success("Xóa phiếu thành công!");
    } catch (err) {
      console.error("Error deleting fuel record:", err);
      toast.error("Không thể xóa phiếu. Vui lòng thử lại.");
    } finally {
      setConfirmTargetId(null);
      setDeletingId(null);
    }
  }

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

  const modalTotal = useMemo(() => {
    const liters = Number(form.liters) || 0;
    const unitPrice = Number(form.unitPrice) || 0;
    return Math.round(liters * unitPrice);
  }, [form.liters, form.unitPrice]);

  if (loading) {
    return (
      <div className="fuel-page">
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

        <div className="fuel-header-simple">
          <div>
            <div className="fuel-header-title">Quản lý nhiên liệu</div>
            <div className="fuel-header-subtitle">
              Theo dõi và quản lý các phiếu đổ xăng cho phương tiện
            </div>
          </div>
        </div>

        <div className="fuel-stats-row">
          <div className="fuel-stat fuel-stat-1">
            <div className="fuel-stat-label">Tổng chi phí</div>
            <div className="fuel-stat-value">...</div>
          </div>
          <div className="fuel-stat fuel-stat-2">
            <div className="fuel-stat-label">Tổng lít</div>
            <div className="fuel-stat-value">...</div>
          </div>
          <div className="fuel-stat fuel-stat-3">
            <div className="fuel-stat-label">Số phiếu</div>
            <div className="fuel-stat-value">...</div>
          </div>
          <div className="fuel-stat fuel-stat-4">
            <div className="fuel-stat-label">Trung bình / phiếu</div>
            <div className="fuel-stat-value">...</div>
          </div>
        </div>

        <div className="fuel-filters">
          <CustomSelect
            value=""
            onChange={() => {}}
            options={[{ value: "", label: "Tất cả phương tiện" }]}
            placeholder="Tất cả phương tiện"
          />
          <input
            type="date"
            className="fuel-date-input"
            value=""
            onChange={() => {}}
            placeholder="Từ ngày"
            disabled
          />
          <input
            type="date"
            className="fuel-date-input"
            value=""
            onChange={() => {}}
            placeholder="Đến ngày"
            disabled
          />
          <button className="fuel-new-btn" disabled>
            + Thêm phiếu
          </button>
        </div>

        <div className="fuel-list">
          <div className="fuel-table-card">
            <div className="fuel-table-wrap">
              <table className="fuel-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Biển số</th>
                    <th>Odometer (km)</th>
                    <th>Số lít</th>
                    <th>Đơn giá</th>
                    <th>Tổng tiền</th>
                    <th>Trạm xăng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan="8"
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
    <div className="fuel-page">
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

      <div className="fuel-header-simple">
        <div>
          <div className="fuel-header-title">Quản lý nhiên liệu</div>
          <div className="fuel-header-subtitle">
            Theo dõi và quản lý các phiếu đổ xăng cho phương tiện
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

      <div className="fuel-stats-row">
        <div className="fuel-stat fuel-stat-1">
          <div className="fuel-stat-label">Tổng chi phí</div>
          <div className="fuel-stat-value">{formatMoney(stats.totalCost)}</div>
        </div>
        <div className="fuel-stat fuel-stat-2">
          <div className="fuel-stat-label">Tổng lít</div>
          <div className="fuel-stat-value">
            {formatNumber(stats.totalLiters)} L
          </div>
        </div>
        <div className="fuel-stat fuel-stat-3">
          <div className="fuel-stat-label">Số phiếu</div>
          <div className="fuel-stat-value">{stats.count}</div>
        </div>
        <div className="fuel-stat fuel-stat-4">
          <div className="fuel-stat-label">Trung bình / phiếu</div>
          <div className="fuel-stat-value">{formatMoney(stats.average)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="fuel-filters-container">
        <div className="fuel-filters-row">
          <div className="fuel-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo biển số xe..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>
          <CustomSelect
            value={filters.vehicleId}
            onChange={(value) => handleFilterChange("vehicleId", value)}
            options={[
              { value: "", label: "Tất cả phương tiện" },
              ...vehicles.map((v) => ({
                value: v.vehicleID,
                label: `${v.licensePlate} - ${v.vehicleModel || v.vehicleType}`,
              })),
            ]}
            placeholder="Tất cả phương tiện"
          />
        </div>
        <div className="fuel-filters-row">
          <CustomSelect
            value={filters.day}
            onChange={(value) => handleFilterChange("day", value)}
            options={[
              { value: "", label: "Tất cả ngày" },
              ...Array.from({ length: 31 }, (_, i) => ({
                value: String(i + 1),
                label: `Ngày ${i + 1}`,
              })),
            ]}
            placeholder="Chọn ngày"
          />
          <CustomSelect
            value={filters.month}
            onChange={(value) => handleFilterChange("month", value)}
            options={[
              { value: "", label: "Tất cả tháng" },
              ...Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: `Tháng ${i + 1}`,
              })),
            ]}
            placeholder="Chọn tháng"
          />
          <CustomSelect
            value={filters.year}
            onChange={(value) => handleFilterChange("year", value)}
            options={[
              { value: "", label: "Tất cả năm" },
              { value: "2024", label: "2024" },
              { value: "2025", label: "2025" },
              { value: "2026", label: "2026" },
            ]}
            placeholder="Chọn năm"
          />
          <input
            type="number"
            className="fuel-amount-input"
            placeholder="Tổng tiền tối thiểu"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange("minAmount", e.target.value)}
          />
          <input
            type="number"
            className="fuel-amount-input"
            placeholder="Tổng tiền tối đa"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
          />
          <button className="fuel-new-btn" onClick={openModal}>
            + Thêm phiếu
          </button>
        </div>
      </div>

      <div className="fuel-list">
        <div className="fuel-table-card">
          <div className="fuel-table-wrap">
            <table className="fuel-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Biển số</th>
                  <th>Odometer (km)</th>
                  <th>Số lít</th>
                  <th>Đơn giá</th>
                  <th>Tổng tiền</th>
                  <th>Trạm xăng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="line-spinner"></div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có phiếu đổ xăng nào
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const vehicle = vehicles.find(
                      (v) => v.vehicleID === record.vehicleID
                    );
                    const unitPrice = record.fuelAmount
                      ? Math.round(
                          (record.fuelCost / record.fuelAmount) * 100
                        ) / 100
                      : 0;
                    return (
                      <tr key={record.fuelRecordID} className="fuel-tr">
                        <td className="fuel-td">
                          {new Date(record.fuelTime).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="fuel-td">
                          {vehicle?.licensePlate || "-"}
                        </td>
                        <td className="fuel-td">
                          {formatNumber(record.currentKm)}
                        </td>
                        <td className="fuel-td">
                          {formatNumber(record.fuelAmount)} L
                        </td>
                        <td className="fuel-td">{formatMoney(unitPrice)}</td>
                        <td className="fuel-td">
                          {formatMoney(record.fuelCost)}
                        </td>
                        <td className="fuel-td">
                          {record.reFuelLocation || "-"}
                        </td>
                        <td className="fuel-td fuel-td-actions">
                          <div className="fuel-actions">
                            <button
                              className="fuel-icon-btn fuel-icon-delete"
                              title="Xóa"
                              onClick={() => handleDelete(record.fuelRecordID)}
                              disabled={deletingId === record.fuelRecordID}
                            >
                              {deletingId === record.fuelRecordID ? (
                                "..."
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      {isModalOpen && (
        <div className="fuel-modal-backdrop" onClick={closeModal}>
          <div
            className="fuel-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="fuel-modal-header">
              <h3>Thêm phiếu đổ xăng</h3>
              <button
                className="fuel-icon-btn-close"
                type="button"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <form className="fuel-modal-body" onSubmit={handleCreate}>
              <div className="fuel-modal-field">
                <label>
                  Phương tiện <span className="fuel-required">*</span>
                </label>
                <select
                  className="fuel-input"
                  value={form.vehicleId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, vehicleId: e.target.value }))
                  }
                >
                  <option value="">Chọn phương tiện</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicleID} value={v.vehicleID}>
                      {v.licensePlate} - {v.vehicleModel || v.vehicleType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fuel-modal-grid">
                <div className="fuel-modal-field">
                  <label>
                    Ngày đổ xăng <span className="fuel-required">*</span>
                  </label>
                  <input
                    className="fuel-input"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>

                <div className="fuel-modal-field">
                  <label>
                    Số km (Odometer) <span className="fuel-required">*</span>
                  </label>
                  <input
                    className="fuel-input"
                    inputMode="numeric"
                    placeholder="Ví dụ: 15000"
                    value={form.odometer}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, odometer: e.target.value }))
                    }
                  />
                </div>

                <div className="fuel-modal-field">
                  <label>
                    Số lít <span className="fuel-required">*</span>
                  </label>
                  <input
                    className="fuel-input"
                    inputMode="decimal"
                    placeholder="Ví dụ: 50"
                    value={form.liters}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, liters: e.target.value }))
                    }
                  />
                </div>

                <div className="fuel-modal-field">
                  <label>
                    Đơn giá (VND/lít) <span className="fuel-required">*</span>
                  </label>
                  <input
                    className="fuel-input"
                    inputMode="numeric"
                    placeholder="Ví dụ: 24000"
                    value={form.unitPrice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        unitPrice: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="fuel-modal-field">
                <label>Tổng tiền</label>
                <div className="fuel-total">{formatMoney(modalTotal)}</div>
                <div className="fuel-total-hint">
                  Được tính tự động: Số lít × Đơn giá
                </div>
              </div>

              <div className="fuel-modal-field">
                <label>
                  Trạm xăng <span className="fuel-required">*</span>
                </label>
                <input
                  className="fuel-input"
                  placeholder="Ví dụ: Petrolimex Nguyễn Văn Linh"
                  value={form.station}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, station: e.target.value }))
                  }
                />
              </div>

              <div className="fuel-modal-field">
                <label>Ghi chú</label>
                <input
                  className="fuel-input"
                  placeholder="Thêm ghi chú nếu cần..."
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </div>

              {formError && <div className="fuel-form-error">{formError}</div>}

              <div className="fuel-modal-actions">
                <button
                  className="fuel-secondary-btn"
                  type="button"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button className="fuel-primary-btn" type="submit">
                  Lưu phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa phiếu đổ xăng này?"
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatNumber(n) {
  const v = Number(n || 0);
  return v.toLocaleString("vi-VN");
}
