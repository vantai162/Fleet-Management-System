import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaTruck,
  FaReply,
  FaEye,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Emergency.css";
import EmergencyAddModal from "../components/EmergencyAddModal";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import emergencyAPI from "../services/emergencyAPI";
import vehicleAPI from "../services/vehicleAPI";

export default function Emergency() {
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Options state
  const [statusOptions, setStatusOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    level: "",
  });

  // Load emergency reports and vehicles from API
  useEffect(() => {
    loadData();
  }, []);

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [statuses, levels] = await Promise.all([
        emergencyAPI.getEmergencyStatuses(),
        emergencyAPI.getEmergencyLevels(),
      ]);
      setStatusOptions([
        { value: "", label: "Tất cả trạng thái" },
        ...statuses,
      ]);
      setLevelOptions([{ value: "", label: "Tất cả mức độ" }, ...levels]);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  // Load reports when filters change
  useEffect(() => {
    if (!loading) {
      loadReports();
    }
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load data sequentially to avoid rate limiting
      console.log("Loading emergency reports...");
      const reportsData = await emergencyAPI.getAllReports({
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        status: filters.status,
        level: filters.level,
      });

      setReports(reportsData.objects || []);
      setPagination((prev) => ({
        ...prev,
        totalItems: reportsData.total || 0,
        totalPages: Math.ceil((reportsData.total || 0) / prev.pageSize),
      }));

      // Load vehicles only once
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Loading vehicles...");
      const vehiclesData = await vehicleAPI.getAllVehicles();
      // Ensure vehicles is always an array
      setVehicles(
        Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.objects || []
      );

      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      // No fallback data - show empty state
      setReports([]);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setTableLoading(true);

      console.log("Loading emergency reports...");
      const reportsData = await emergencyAPI.getAllReports({
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        status: filters.status,
        level: filters.level,
      });

      setReports(reportsData.objects || []);
      setPagination((prev) => ({
        ...prev,
        totalItems: reportsData.total || 0,
        totalPages: Math.ceil((reportsData.total || 0) / prev.pageSize),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setReports([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      const newReport = await emergencyAPI.createReport(reportData);
      await loadReports(); // Reload to get updated data
      setShowAddModal(false);
      toast.success("Tạo báo cáo khẩn cấp thành công!");
    } catch (err) {
      console.error("Error creating report:", err);
      toast.error("Không thể tạo báo cáo. Vui lòng thử lại.");
    }
  };

  const handleRespondReport = async (reportId) => {
    try {
      await emergencyAPI.respondToReport({
        EmergencyID: reportId,
        RespondedByUserID: 1, // TODO: Get from auth context
      });
      await loadReports(); // Reload to get updated data
      toast.success("Đã phản hồi báo cáo thành công!");
    } catch (err) {
      console.error("Error responding to report:", err);
      toast.error("Không thể phản hồi báo cáo. Vui lòng thử lại.");
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

  const stats = {
    newReports: reports.filter((r) => r.status === "new" || !r.respondedAt)
      .length,
    processing: reports.filter((r) => r.status === "processing").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    critical: reports.filter((r) => r.level === "critical").length,
  };

  if (loading) {
    return (
      <div className="emergency-page">
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

        <div className="emergency-header-simple">
          <div>
            <div className="emergency-header-title">Báo cáo khẩn cấp</div>
            <div className="emergency-header-subtitle">
              Xử lý các báo cáo khẩn cấp từ tài xế
            </div>
          </div>
        </div>

        <div className="emergency-stats-row">
          <div className="em-stat em-stat-1">
            <div className="em-stat-label">Báo cáo mới</div>
            <div className="em-stat-value">...</div>
          </div>
          <div className="em-stat em-stat-2">
            <div className="em-stat-label">Đang xử lý</div>
            <div className="em-stat-value">...</div>
          </div>
          <div className="em-stat em-stat-3">
            <div className="em-stat-label">Đã giải quyết</div>
            <div className="em-stat-value">...</div>
          </div>
          <div className="em-stat em-stat-4">
            <div className="em-stat-label">Khẩn cấp</div>
            <div className="em-stat-value">...</div>
          </div>
        </div>

        <div className="emergency-filters">
          <CustomSelect
            value=""
            onChange={() => {}}
            options={[{ value: "", label: "Tất cả trạng thái" }]}
            placeholder="Tất cả trạng thái"
          />

          <CustomSelect
            value=""
            onChange={() => {}}
            options={[{ value: "", label: "Tất cả mức độ" }]}
            placeholder="Tất cả mức độ"
          />

          <button className="emergency-new-btn" disabled>
            + Báo cáo mới
          </button>
        </div>

        <div className="emergency-list">
          <div className="emergency-table-card">
            <div className="emergency-table-wrap">
              <table className="emergency-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Mức độ</th>
                    <th>Trạng thái</th>
                    <th>Vị trí</th>
                    <th>Phương tiện</th>
                    <th>Ngày báo cáo</th>
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
    <div className="emergency-page">
      <div className="emergency-header-simple">
        <div>
          <div className="emergency-header-title">Báo cáo khẩn cấp</div>
          <div className="emergency-header-subtitle">
            Xử lý các báo cáo khẩn cấp từ tài xế
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

      <div className="emergency-stats-row">
        <div className="em-stat em-stat-1">
          <div className="em-stat-label">Báo cáo mới</div>
          <div className="em-stat-value">{stats.newReports}</div>
        </div>
        <div className="em-stat em-stat-2">
          <div className="em-stat-label">Đang xử lý</div>
          <div className="em-stat-value">{stats.processing}</div>
        </div>
        <div className="em-stat em-stat-3">
          <div className="em-stat-label">Đã giải quyết</div>
          <div className="em-stat-value">{stats.resolved}</div>
        </div>
        <div className="em-stat em-stat-4">
          <div className="em-stat-label">Khẩn cấp</div>
          <div className="em-stat-value">{stats.critical}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="emergency-filters">
        <CustomSelect
          value={filters.status}
          onChange={(value) => handleFilterChange("status", value)}
          options={statusOptions}
          placeholder="Tất cả trạng thái"
        />

        <CustomSelect
          value={filters.level}
          onChange={(value) => handleFilterChange("level", value)}
          options={levelOptions}
          placeholder="Tất cả mức độ"
        />

        <button
          className="emergency-new-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Báo cáo mới
        </button>
      </div>

      <div className="emergency-list">
        <div className="emergency-table-card">
          <div className="emergency-table-wrap">
            <table className="emergency-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Mức độ</th>
                  <th>Trạng thái</th>
                  <th>Vị trí</th>
                  <th>Phương tiện</th>
                  <th>Ngày báo cáo</th>
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
                ) : reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có báo cáo nào
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="emergency-tr">
                      <td className="emergency-td">
                        <div className="emergency-title-cell">
                          <div className="emergency-title-text">{r.title}</div>
                          <div className="emergency-desc-text">{r.desc}</div>
                        </div>
                      </td>
                      <td className="emergency-td">
                        <span
                          className={`emergency-level-badge ${
                            r.level === "critical"
                              ? "level-critical"
                              : "level-high"
                          }`}
                        >
                          {r.level === "critical" ? "Khẩn cấp" : "Cao"}
                        </span>
                      </td>
                      <td className="emergency-td">
                        <span className="emergency-status-badge">
                          {r.status === "resolved"
                            ? "Đã giải quyết"
                            : r.status === "processing"
                            ? "Đang xử lý"
                            : "Mới"}
                        </span>
                      </td>
                      <td className="emergency-td">
                        <div className="emergency-location-text">
                          {r.location}
                        </div>
                      </td>
                      <td className="emergency-td">
                        <div className="emergency-vehicle-cell">
                          <div className="emergency-vehicle-text">
                            {r.vehicle}
                          </div>
                          <div className="emergency-driver-text">
                            Tài xế: {r.driver}
                          </div>
                        </div>
                      </td>
                      <td className="emergency-td">
                        <div className="emergency-date-cell">
                          <div className="emergency-date-day">
                            {new Date(r.reportedAt).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="emergency-date-time">
                            {new Date(r.reportedAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="emergency-td emergency-td-actions">
                        <div className="emergency-actions">
                          <button
                            className="emergency-icon-btn emergency-icon-view"
                            title="Xem chi tiết"
                            onClick={() => {
                              /* TODO: Open detail modal */
                            }}
                          >
                            <FaEye />
                          </button>
                          {r.status !== "resolved" && !r.respondedAt && (
                            <button
                              className="emergency-icon-btn emergency-icon-respond"
                              title="Phản hồi"
                              onClick={() => handleRespondReport(r.id)}
                            >
                              <FaReply />
                            </button>
                          )}
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

      {showAddModal && (
        <EmergencyAddModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateReport}
          vehicles={vehicles}
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
