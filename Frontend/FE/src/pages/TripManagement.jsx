import { useEffect, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { MdLocationOn } from "react-icons/md";
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaEye,
  FaPhone,
} from "react-icons/fa";
import { confirmOrderStep, getOrders } from "../services/ordersAPI";
import "./TripManagement.css";
import "./Orders.css";
import TripCostModal from "../components/TripCostModal";
import TripDetailModal from "../components/TripDetailModal";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import { API_CONFIG } from "../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    todayTrips: 0,
    inProgress: 0,
    completed: 0,
    totalDistance: "0 km",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [payTrip, setPayTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [orderTrip, setOrderTrip] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
    day: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    loadTrips();
  }, [pagination.currentPage, pagination.pageSize, filters, searchTerm]);

  useEffect(() => {
    loadStats();
    loadStatusOptions();
  }, []);

  const loadStatusOptions = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/options/statuses`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStatusOptions([{ value: "", label: "Tất cả trạng thái" }, ...data]);
      }
    } catch (err) {
      console.error("Error loading status options:", err);
    }
  };

  const handleOpenOrders = (trip) => {
    setOrderTrip(trip);
    setLoadingOrders(true);
    // pass trip id to backend call (backend expects tripId)
    const tripId = trip?.tripID || trip?.id;
    getOrders(tripId)
      .then((data) => {
        setOrders(data || []);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  };

  const loadTrips = async () => {
    try {
      setTableLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("pageNumber", pagination.currentPage);
      queryParams.append("pageSize", pagination.pageSize);

      // Search keyword
      if (searchTerm) {
        queryParams.append("keyword", searchTerm);
      }

      // Filter out "planned" trips - only show confirmed/in-progress/completed
      if (filters.status) {
        queryParams.append("tripStatus", filters.status);
      }

      // Date filters
      if (filters.day) {
        queryParams.append("day", filters.day);
      }
      if (filters.month) {
        queryParams.append("month", filters.month);
      }
      if (filters.year) {
        queryParams.append("year", filters.year);
      }

      // If current user is a driver, limit trips to those assigned to them
      try {
        const stored = localStorage.getItem("fms.currentUser");
        if (stored) {
          const cu = JSON.parse(stored);
          const role = (cu?.role || "").toString().trim().toLowerCase();
          if (role === "driver") {
            // support multiple possible id field names
            const uid = cu?.userID ?? cu?.UserID ?? cu?.id ?? cu?.userId ?? null;
            if (uid) {
              queryParams.append("driverUserId", uid);
            }
          }
        }
      } catch {
        // ignore
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip?${queryParams}`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Trip API response:", data);
      const tripsList = data.objects || data.items || data || [];
      console.log(
        "Trips list (backend already filtered out planned):",
        tripsList
      );

      // Backend already filters out "planned" trips, no need to filter again
      const filteredTrips = tripsList;

      // Backend now handles search, so no need to filter again here
      const searchFiltered = filteredTrips;

      // Sort ascending by trip id (support both tripID and id)
      const sorted = (searchFiltered || []).slice().sort((a, b) => {
        const aid = Number(a.tripID ?? a.id ?? 0);
        const bid = Number(b.tripID ?? b.id ?? 0);
        return aid - bid;
      });

      setTrips(sorted);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.total || searchFiltered.length || 0,
        totalPages: Math.ceil(
          (data.total || searchFiltered.length || 0) / prev.pageSize
        ),
      }));
    } catch (err) {
      console.error("Error loading trips:", err);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      setTrips([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Trip/stats`, {
        headers: API_CONFIG.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          todayTrips: data.todayTrips || 0,
          inProgress: data.inProgress || 0,
          completed: data.completed || 0,
          totalDistance: data.totalDistance || "0 km",
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleAddCharge = (tripId, charge) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.tripID !== tripId) return t;
        const newCharges = [...(t.charges || []), charge];
        const existingTotal = (t.charges || []).reduce(
          (sum, c) => sum + (c.amountNumber || 0),
          0
        );
        const newTotal = existingTotal + (charge.amountNumber || 0);
        return {
          ...t,
          charges: newCharges,
          cost: `${newTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`,
        };
      })
    );
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase();
    const badges = {
      completed: { text: "Hoàn Thành", class: "status-completed" },
      delivered: { text: "Hoàn Thành", class: "status-completed" },
      "in-progress": { text: "Đang Thực Hiện", class: "status-in-progress" },
      in_transit: { text: "Đang Thực Hiện", class: "status-in-progress" },
      waiting: { text: "Chờ Xử Lý", class: "status-waiting" },
      confirmed: { text: "Đã Xác Nhận", class: "status-confirmed" },
    };
    return (
      badges[statusLower] || {
        text: status || "Không rõ",
        class: "status-default",
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
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

  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Tất cả trạng thái" },
    { value: "waiting", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "in_transit", label: "Đang thực hiện" },
    { value: "completed", label: "Hoàn thành" },
  ]);

  const orderStats = {
    waiting: orders.filter((o) => o.status === "waiting").length,
    in_transit: orders.filter((o) => o.status === "in_transit").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    gps_confirm: orders.filter((o) =>
      Array.isArray(o.steps) && o.steps.some((s) => s.key === "gps" && s.done)
    ).length,
    phone_confirm: orders.filter((o) =>
      Array.isArray(o.steps) && o.steps.some((s) => s.key === "phone" && s.done)
    ).length,
  };

  const handleConfirmOrderStep = async (orderId, stepKey) => {
    // Only drivers can confirm steps
    let currentUser = null;
    try {
      const stored = localStorage.getItem("fms.currentUser");
      currentUser = stored ? JSON.parse(stored) : null;
    } catch {
      currentUser = null;
    }
    const role = (currentUser?.role || "").toString().trim().toLowerCase();
    if (role !== "driver") {
      toast.error("Chỉ có tài xế mới có thể xác nhận");
      return;
    }

    try {
    const updated = await confirmOrderStep(orderId, stepKey);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success("Xác nhận thành công");
    } catch (err) {
      console.error("Error confirming step:", err);
      toast.error("Xác nhận thất bại");
    }
  };

  if (loading) {
    return (
      <div className="trip-management">
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

        <div className="trip-header-simple">
          <div>
            <div className="trip-header-title">Quản lý chuyến đi</div>
            <div className="trip-header-subtitle">
              Theo dõi và quản lý các chuyến đi
            </div>
          </div>
        </div>

        <div className="trip-stats-row">
          <div className="trip-stat trip-stat-1">
            <div className="trip-stat-label">Tổng chuyến hôm nay</div>
            <div className="trip-stat-value">...</div>
          </div>
          <div className="trip-stat trip-stat-2">
            <div className="trip-stat-label">Đang thực hiện</div>
            <div className="trip-stat-value">...</div>
          </div>
          <div className="trip-stat trip-stat-3">
            <div className="trip-stat-label">Hoàn thành</div>
            <div className="trip-stat-value">...</div>
          </div>
          <div className="trip-stat trip-stat-4">
            <div className="trip-stat-label">Tổng quãng đường</div>
            <div className="trip-stat-value">...</div>
          </div>
        </div>

        <div className="trip-list">
          <div className="trip-filters-container">
            <div className="trip-filters-row">
              <div className="trip-search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo biển số xe / tài xế..."
                  value=""
                  onChange={() => {}}
                  disabled
                />
              </div>
              <CustomSelect
                value=""
                onChange={() => {}}
                options={[{ value: "", label: "Tất cả trạng thái" }]}
                placeholder="Tất cả trạng thái"
              />
            </div>
            <div className="trip-filters-row">
              <CustomSelect
                value=""
                onChange={() => {}}
                options={[{ value: "", label: "Tất cả ngày" }]}
                placeholder="Chọn ngày"
              />
              <CustomSelect
                value=""
                onChange={() => {}}
                options={[{ value: "", label: "Tất cả tháng" }]}
                placeholder="Chọn tháng"
              />
              <CustomSelect
                value=""
                onChange={() => {}}
                options={[{ value: "", label: "Tất cả năm" }]}
                placeholder="Chọn năm"
              />
            </div>
          </div>

          <div className="trip-table-card">
            <div className="trip-table-wrap">
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>MÃ CHUYẾN</th>
                    <th>XE / TÀI XẾ</th>
                    <th>LỘ TRÌNH</th>
                    <th>THỜI GIAN</th>
                    <th>KHOẢNG CÁCH</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="loading-cell">
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
    <div className="trip-management">
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

      <div className="trip-header-simple">
        <div>
          <div className="trip-header-title">Quản lý chuyến đi</div>
          <div className="trip-header-subtitle">
            Theo dõi và quản lý các chuyến đi
          </div>
        </div>
      </div>

      <div className="trip-stats-row">
        <div className="trip-stat trip-stat-1">
          <div className="trip-stat-label">Tổng chuyến hôm nay</div>
          <div className="trip-stat-value">{stats.todayTrips}</div>
        </div>
        <div className="trip-stat trip-stat-2">
          <div className="trip-stat-label">Đang thực hiện</div>
          <div className="trip-stat-value">{stats.inProgress}</div>
        </div>
        <div className="trip-stat trip-stat-3">
          <div className="trip-stat-label">Hoàn thành</div>
          <div className="trip-stat-value">{stats.completed}</div>
        </div>
        <div className="trip-stat trip-stat-4">
          <div className="trip-stat-label">Tổng quãng đường</div>
          <div className="trip-stat-value">{stats.totalDistance}</div>
        </div>
      </div>

      {orderTrip ? (
        <div className="content-card trip-orders-detail">
          <button
            type="button"
            className="trip-orders-back"
            onClick={() => setOrderTrip(null)}
          >
            {"<- Quay lại danh sách chuyến đi"}
          </button>

          <div className="trip-orders-header">
            <div className="trip-orders-title">
              <span className="trip-orders-icon">
                <FaBox />
              </span>
              <div>
                <h2>Quản lý đơn hàng - Chuyến {orderTrip.tripID}</h2>
                <p>
                  {orderTrip.startLocation} → {orderTrip.endLocation} |{" "}
                  {formatDate(orderTrip.startTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="trip-orders-stats">
            <div className="trip-orders-stat">
              <div className="trip-orders-stat-label">Tổng đơn hàng</div>
              <div className="trip-orders-stat-value">{orders.length}</div>
            </div>
            <div className="trip-orders-stat">
              <div className="trip-orders-stat-label">Đang vận chuyển</div>
              <div className="trip-orders-stat-value">
                {orderStats.in_transit}
              </div>
            </div>
            <div className="trip-orders-stat">
              <div className="trip-orders-stat-label">Đã giao</div>
              <div className="trip-orders-stat-value">
                {orderStats.delivered}
              </div>
            </div>
            <div className="trip-orders-stat">
              <div className="trip-orders-stat-label">Chờ xử lý</div>
              <div className="trip-orders-stat-value">{orderStats.waiting}</div>
            </div>
          </div>

          <div className="orders-list">
            {loadingOrders ? (
              <div className="order-card">Đang tải...</div>
            ) : orders.length === 0 ? (
              <div className="order-card">Chưa có đơn hàng nào.</div>
            ) : (
              orders.map((o) => {
                const nextStepIndex = Array.isArray(o.steps)
                  ? o.steps.findIndex((s) => !s.done)
                  : -1;
                const completedCount = Array.isArray(o.steps)
                  ? o.steps.reduce((c, s) => c + (s.done ? 1 : 0), 0)
                  : 0;
                const segments = Array.isArray(o.steps) ? Math.max(o.steps.length - 1, 1) : 1;
                const progressPercent = Math.round((Math.min(completedCount, segments) / segments) * 100);
                return (
                <div className="order-card" key={o.id}>
                  <div className="order-card-top">
                      <div className="order-left">
                      <div className="order-id">
                        {o.id}{" "}
                        <span className={`order-badge order-${o.status}`}>
                          {o.status === "in_transit"
                            ? "Đang vận chuyển"
                            : o.status === "delivered"
                            ? "Đã giao"
                            : "Đang chờ"}
                        </span>
                      </div>
                        <div className="cust-label">Khách hàng</div>
                      <div className="order-customer">{o.customer}</div>
                      <div className="order-contact">{o.contact}</div>
                    </div>

                      <div className="order-right">
                    <div className="order-vehicle">
                      <div className="ov-label">Phương tiện / Tài xế</div>
                      <div className="ov-main">{o.vehicle}</div>
                      <div className="ov-sub">{o.driver}</div>
                        </div>
                        <button
                          className="order-detail-btn"
                          onClick={() => {
                            /* open trip detail for this trip (reuse existing modal) */
                            setSelectedTripId(orderTrip?.tripID || null);
                          }}
                        >
                          Chi tiết
                        </button>
                    </div>
                  </div>

                  <div className="order-locations">
                    <div className="loc">
                      <MdLocationOn className="loc-icon" />
                      <div>
                        <div className="loc-title">Điểm lấy hàng</div>
                        <div className="loc-text">{o.pickup}</div>
                      </div>
                    </div>
                    <div className="loc">
                      <MdLocationOn className="loc-icon loc-dest" />
                      <div>
                        <div className="loc-title">Điểm giao hàng</div>
                        <div className="loc-text">{o.dropoff}</div>
                      </div>
                    </div>
                  </div>

                  <div className="order-steps">
                      <div className="steps-track" style={{ ["--progress"]: `${progressPercent}%` }}>
                      {o.steps.map((s, idx) => (
                        <div
                            className={`step ${s.key === "delivered" ? "deliver-step" : ""}`}
                          key={s.key}
                        >
                            <div className="step-wrapper">
                              <div
                                className={`step-card ${s.done ? "done" : ""} ${s.key}`}
                              >
                          <div
                                  className={`step-node ${s.key} ${s.done ? "done" : ""} ${s.key === "delivered" && s.done ? "done-delivered" : ""}`}
                          >
                            {s.done ? (
                              <FaCheckCircle />
                            ) : s.key === "phone" ? (
                              <FaPhone />
                            ) : (
                              <FaClock />
                            )}
                                </div>
                          </div>

                          {idx < o.steps.length - 1 && (
                            <div
                              className={`connector ${s.done ? "done" : ""}`}
                            />
                          )}
                            </div>

                          <div className="step-label">{s.label}</div>
                          {s.time ? (
                              <div className={`step-time ${s.done ? "done" : ""}`}>{s.time}</div>
                          ) : null}

                            {/* only allow action on the next pending step */}
                            {idx === nextStepIndex && !s.done && (
                            <div className="step-action">
                                {s.key === "delivered" ? (
                              <button
                                    className="btn-complete"
                                    onClick={() => handleConfirmOrderStep(o.id, s.key)}
                              >
                                    Hoàn thành
                              </button>
                                ) : (
                              <button
                                    className="btn btn-primary"
                                    onClick={() => handleConfirmOrderStep(o.id, s.key)}
                              >
                                    Xác nhận
                              </button>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {!orderTrip ? (
        <div className="trip-list">
          <div className="trip-filters-container">
            <div className="trip-filters-row">
              <div className="trip-search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo biển số xe / tài xế..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CustomSelect
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                options={statusOptions}
                placeholder="Tất cả trạng thái"
              />
            </div>
            <div className="trip-filters-row">
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
            </div>
          </div>

          <div className="trip-table-card">
            <div className="trip-table-wrap">
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>MÃ CHUYẾN</th>
                    <th>XE / TÀI XẾ</th>
                    <th>LỘ TRÌNH</th>
                    <th>THỜI GIAN</th>
                    <th>KHOẢNG CÁCH</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td colSpan="7" className="loading-cell">
                        <div className="line-spinner"></div>
                      </td>
                    </tr>
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        Không tìm thấy chuyến đi
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip) => {
                      // tripStatus could be in different fields - normalize/trim to avoid whitespace/casing issues
                      const rawStatus =
                        trip.status ?? trip.tripStatus ?? trip.Status ?? "";
                      const status = (rawStatus || "").toString().trim();
                      const statusKey = status.toLowerCase();
                      const badge = getStatusBadge(statusKey);
                      return (
                        <tr key={trip.id || trip.tripID} className="trip-tr">
                          <td className="trip-td">
                            <div className="trip-code">
                              #{trip.id || trip.tripID}
                            </div>
                          </td>
                          <td className="trip-td">
                            <div className="trip-vehicle">
                              <div className="vehicle-main">
                                {trip.vehicle || "-"}
                              </div>
                              <div className="vehicle-sub">
                                {trip.driver || "-"}
                              </div>
                            </div>
                          </td>
                          <td className="trip-td">
                            <div className="route-cell">
                              <MdLocationOn className="route-icon" />
                              <div>
                                {trip.route ||
                                  `${trip.startLocation || ""} → ${
                                    trip.endLocation || ""
                                  }`}
                              </div>
                            </div>
                          </td>
                          <td className="trip-td">
                            {trip.date || formatDate(trip.startTime)}
                            {trip.time && ` • ${trip.time}`}
                            {!trip.time &&
                              trip.startTime &&
                              ` • ${formatTime(trip.startTime)}`}
                          </td>
                          <td className="trip-td">
                            {trip.distance ||
                              (trip.totalDistanceKm
                                ? `${trip.totalDistanceKm} km`
                                : "-")}
                          </td>
                          <td className="trip-td">
                            <span className={`status-badge ${badge.class}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="trip-td trip-td-actions">
                            <div className="trip-actions">
                              <button
                                className="trip-icon-btn trip-icon-view"
                                title="Xem chi tiết"
                                onClick={() =>
                                  setSelectedTripId(trip.id || trip.tripID)
                                }
                              >
                                <FaEye />
                              </button>
                              <button
                                className="trip-icon-btn trip-icon-pay"
                                title="Chi phí"
                                onClick={() => setPayTrip(trip)}
                              >
                                <FaDollarSign />
                              </button>
                              <button
                                className="trip-icon-btn trip-icon-box"
                                title="Đơn hàng"
                                onClick={() => handleOpenOrders(trip)}
                              >
                                <FaBox />
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
        </div>
      ) : null}

      {selectedTripId && (
        <TripDetailModal
          tripId={selectedTripId}
          onClose={() => setSelectedTripId(null)}
        />
      )}

      {payTrip ? (
        <TripCostModal
          trip={payTrip}
          onClose={() => setPayTrip(null)}
          onAddCharge={handleAddCharge}
        />
      ) : null}
    </div>
  );
};

export default TripManagement;
