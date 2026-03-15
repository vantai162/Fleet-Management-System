import { useState, useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { FaEye, FaSearch } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import maintenanceAPI, {
  getMaintenanceRecords,
  getMaintenanceStats,
} from "../services/maintenanceAPI";
import vehicleAPI from "../services/vehicleAPI";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import "./Maintenance.css";
import "./TripManagement.css";
import MaintenanceAddModal from "../components/MaintenanceAddModal";
import MaintenanceDetailModal from "../components/MaintenanceDetailModal";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  // Options state
  const [typeOptions, setTypeOptions] = useState([]);
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
    keyword: "",
    maintenanceType: "",
    maintenanceStatus: "",
    day: "",
    month: "",
    year: "",
    minAmount: "",
    maxAmount: "",
  });

  // Detail modal state
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [types, statuses] = await Promise.all([
        maintenanceAPI.getMaintenanceTypes(),
        maintenanceAPI.getMaintenanceStatuses(),
      ]);
      setTypeOptions([{ value: "", label: "Tất cả loại bảo trì" }, ...types]);
      setStatusOptions([
        { value: "", label: "Tất cả trạng thái" },
        ...statuses,
      ]);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data sequentially to avoid rate limiting
      console.log("Loading maintenance records...");
      const recordsData = await getMaintenanceRecords({
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        maintenanceType: filters.maintenanceType,
        maintenanceStatus: filters.maintenanceStatus,
        day: filters.day,
        month: filters.month,
        year: filters.year,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
      });

      setRecords(recordsData.objects || recordsData || []);
      setPagination((prev) => ({
        ...prev,
        totalItems: recordsData.total || recordsData.length || 0,
        totalPages: Math.ceil(
          (recordsData.total || recordsData.length || 0) / prev.pageSize
        ),
      }));

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Loading maintenance stats...");
      const statsData = await getMaintenanceStats();
      setStats(statsData);

      // Only load services and vehicles if we need them (when opening modal)
      // This reduces initial API calls
    } catch (err) {
      console.error("Error loading maintenance data:", err);
      setError("Không thể tải dữ liệu bảo trì. Hiển thị dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  // Load services and vehicles only when needed
  const loadServicesAndVehicles = async () => {
    try {
      console.log("Loading services and vehicles...");
      const [servicesData, vehiclesData] = await Promise.all([
        maintenanceAPI.getAllServices().catch(() => []),
        vehicleAPI.getAllVehicles().catch(() => []),
      ]);
      setServices(servicesData);
      // Ensure vehicles is always an array
      setVehicles(
        Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.objects || []
      );
    } catch (err) {
      console.error("Error loading services/vehicles:", err);
      setServices([]);
      setVehicles([]);
    }
  };

  const handleCreateMaintenance = async (maintenanceData) => {
    try {
      await maintenanceAPI.createMaintenance(maintenanceData);
      await loadData(); // Reload data to get updated list
      setShowAddModal(false);
      toast.success("Tạo hóa đơn bảo trì thành công!");
    } catch (err) {
      console.error("Error creating maintenance:", err);
      toast.error("Không thể tạo hóa đơn bảo trì. Vui lòng thử lại.");
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
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { text: "Đã lên lịch", class: "status-scheduled" },
      "in-progress": { text: "Đang thực hiện", class: "status-in-progress" },
      completed: { text: "Hoàn thành", class: "status-completed" },
      overdue: { text: "Quá hạn", class: "status-overdue" },
    };
    return badges[status] || badges["scheduled"];
  };

  const overdueRecords = records.filter((r) => r.status === "overdue");

  // Prepare pie chart data
  const pieChartData = {
    labels: stats.serviceStats?.map((service) => service.serviceName) || [],
    datasets: [
      {
        data: stats.serviceStats?.map((service) => service.percentage) || [],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
        ],
        borderColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header-simple">
        <div>
          <div className="maintenance-header-title">Bảo trì & Sửa chữa</div>
          <div className="maintenance-header-subtitle">
            Quản lý bảo dưỡng và hóa đơn phương tiện
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

      <div className="maintenance-stats-row">
        <div className="maint-stat maint-stat-1">
          <div className="maint-stat-label">Tổng hóa đơn</div>
          <div className="maint-stat-value">{stats.totalInvoices || 0}</div>
        </div>
        <div className="maint-stat maint-stat-2">
          <div className="maint-stat-label">Tổng chi phí</div>
          <div className="maint-stat-value">{stats.totalCost || "0đ"}</div>
        </div>
        <div className="maint-stat maint-stat-3">
          <div className="maint-stat-label">Dịch vụ khả dụng</div>
          <div className="maint-stat-value">{stats.availableServices || 0}</div>
        </div>
        <div className="maint-stat maint-stat-4">
          <div className="maint-stat-label">Hoàn thành</div>
          <div className="maint-stat-value">{stats.completedInvoices || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="maintenance-filters-container">
        <div className="maintenance-filters-row">
          <div className="maintenance-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hóa đơn hoặc KTV..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>
          <CustomSelect
            value={filters.maintenanceType}
            onChange={(value) => handleFilterChange("maintenanceType", value)}
            options={typeOptions}
            placeholder="Tất cả loại bảo trì"
          />
          <CustomSelect
            value={filters.maintenanceStatus}
            onChange={(value) => handleFilterChange("maintenanceStatus", value)}
            options={statusOptions}
            placeholder="Tất cả trạng thái"
          />
        </div>
        <div className="maintenance-filters-row">
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
            className="maintenance-amount-input"
            placeholder="Tổng tiền tối thiểu"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange("minAmount", e.target.value)}
          />
          <input
            type="number"
            className="maintenance-amount-input"
            placeholder="Tổng tiền tối đa"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
          />
          <button
            className="maintenance-add-btn"
            onClick={async () => {
              setShowAddModal(true);
              // Load services and vehicles when modal opens
              if (services.length === 0 || vehicles.length === 0) {
                await loadServicesAndVehicles();
              }
            }}
          >
            + Tạo hóa đơn mới
          </button>
        </div>
      </div>

      <div className="maintenance-content">
        <div className="maintenance-left">
          {overdueRecords.length > 0 && (
            <div className="alert-banner">
              <FiAlertTriangle className="alert-icon" />
              <div className="alert-content">
                <div className="alert-title">Cảnh báo bảo trì</div>
                <ul className="alert-items">
                  {overdueRecords.map((record) => (
                    <li key={record.id}>
                      Xe {record.vehicle} - {record.description} - Ngày{" "}
                      {record.scheduledDate}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="maintenance-list">
            <div className="maintenance-table-card">
              <div className="maintenance-table-wrap">
                <table className="maintenance-table">
                  <thead>
                    <tr>
                      <th>Hóa đơn</th>
                      <th>Phương tiện</th>
                      <th>Loại bảo trì</th>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <div className="line-spinner"></div>
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#6b7280",
                          }}
                        >
                          Không có hóa đơn nào
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => {
                        const badge = getStatusBadge(record.status);
                        return (
                          <tr key={record.id} className="maintenance-tr">
                            <td className="maintenance-td">
                              <div className="maintenance-invoice-cell">
                                <div className="maintenance-invoice-text">
                                  {record.invoiceNumber || `HD-BT-${record.id}`}
                                </div>
                                <div className="maintenance-tech-text">
                                  KTV:{" "}
                                  {record.technician ||
                                    record.technicianName ||
                                    "-"}
                                </div>
                              </div>
                            </td>
                            <td className="maintenance-td">
                              <div className="maintenance-vehicle-text">
                                {record.plateNumber || record.vehicle}
                              </div>
                            </td>
                            <td className="maintenance-td">
                              <div className="maintenance-type-text">
                                {record.type}
                              </div>
                            </td>
                            <td className="maintenance-td">
                              <div className="maintenance-date-cell">
                                <div className="maintenance-date-day">
                                  {record.date
                                    ? new Date(record.date).toLocaleDateString(
                                        "vi-VN"
                                      )
                                    : new Date(
                                        record.scheduledDate
                                      ).toLocaleDateString("vi-VN")}
                                </div>
                                <div className="maintenance-date-time">
                                  {record.date
                                    ? new Date(record.date).toLocaleTimeString(
                                        "vi-VN",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "08:00"}
                                </div>
                              </div>
                            </td>
                            <td className="maintenance-td">
                              <span
                                className={`maintenance-status-badge ${badge.class}`}
                              >
                                {badge.text}
                              </span>
                            </td>
                            <td className="maintenance-td">
                              <div className="maintenance-amount-text">
                                {record.totalAmount
                                  ? record.totalAmount.toLocaleString() + "đ"
                                  : "0đ"}
                              </div>
                            </td>
                            <td className="maintenance-td maintenance-td-actions">
                              <div className="maintenance-actions">
                                <button
                                  className="maintenance-icon-btn maintenance-icon-view"
                                  title="Xem chi tiết"
                                  onClick={() => {
                                    setSelectedRecordId(record.id);
                                    setShowDetailModal(true);
                                  }}
                                >
                                  <FaEye />
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

          {showAddModal && (
            <MaintenanceAddModal
              onClose={() => setShowAddModal(false)}
              onSave={handleCreateMaintenance}
              vehicles={vehicles}
              services={services}
            />
          )}

          {showDetailModal && selectedRecordId && (
            <MaintenanceDetailModal
              recordId={selectedRecordId}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedRecordId(null);
              }}
            />
          )}
        </div>

        <aside className="maintenance-right">
          <div className="service-chart-container">
            <h3 className="chart-title">Thống kê dịch vụ</h3>
            {stats.serviceStats && stats.serviceStats.length > 0 ? (
              <div className="pie-chart-wrapper">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            ) : (
              <div className="no-data-message">
                <p>Chưa có dữ liệu thống kê dịch vụ</p>
              </div>
            )}
          </div>
        </aside>
      </div>

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
};

export default Maintenance;
