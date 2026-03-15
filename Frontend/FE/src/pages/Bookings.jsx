import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaBan, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Bookings.css";
import Pagination from "../components/Pagination";
import BookingDetailModal from "../components/BookingDetailModal";
import ConfirmModal from "../components/ConfirmModal";
import CustomSelect from "../components/CustomSelect";
import AddBookingModal from "../components/AddBookingModal";
import { API_CONFIG } from "../config/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [addBookingOpen, setAddBookingOpen] = useState(false);

  // Stats state - tổng thể không phụ thuộc pagination
  const [stats, setStats] = useState({
    planned: 0,
  });

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
    day: "",
    month: "",
    year: "",
  });

  // Load bookings from API
  useEffect(() => {
    loadBookings();
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Load stats once on mount
  useEffect(() => {
    loadStats();
  }, []);

  // using BookingDetailModal in create mode when selectedBookingId === "new"

  const loadBookings = async () => {
    try {
      setTableLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("pageNumber", pagination.currentPage);
      queryParams.append("pageSize", pagination.pageSize);
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.day) queryParams.append("day", filters.day);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.year) queryParams.append("year", filters.year);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/booked?${queryParams}`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const bookingsList = data.objects || data.items || data || [];
      const arr = Array.isArray(bookingsList) ? bookingsList : [];
      // sort ascending by tripID (support both tripID and id)
      arr.sort((a, b) => {
        const aid = Number(a.tripID ?? a.id ?? 0);
        const bid = Number(b.tripID ?? b.id ?? 0);
        return aid - bid;
      });
      setBookings(arr);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.total || bookingsList.length || 0,
        totalPages: Math.ceil(
          (data.total || bookingsList.length || 0) / prev.pageSize
        ),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setBookings([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Trip/booked/stats`, {
        headers: API_CONFIG.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          planned: data.planned || 0,
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
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

  const handleCancelBooking = async (tripId) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/booked/${tripId}/cancel`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể hủy lịch đặt trước");
      }

      toast.success("Đã hủy lịch đặt trước thành công!");
      await loadBookings();
      await loadStats();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Không thể hủy lịch đặt trước. Vui lòng thử lại.");
    }
  };

  const handleDeleteBooking = async (tripId) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/booked/${tripId}`,
        {
          method: "DELETE",
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa lịch đặt trước");
      }

      toast.success("Đã xóa lịch đặt trước thành công!");
      await loadBookings();
      await loadStats();
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error("Không thể xóa lịch đặt trước. Vui lòng thử lại.");
    }
  };

  const promptCancelBooking = (tripId) => {
    setConfirmTarget(tripId);
    setConfirmAction("cancel");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (confirmAction === "cancel") {
      handleCancelBooking(confirmTarget);
    } else if (confirmAction === "delete") {
      handleDeleteBooking(confirmTarget);
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
    setConfirmAction(null);
  };

  const handleBookingSaved = async () => {
    setAddBookingOpen(false);
    await loadBookings();
    await loadStats();
  };

  // AddBookingModal will handle creation; handleBookingSaved refreshes list after modal calls onSave()

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      // If it's a full datetime, extract time
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getStatusLabel = (status) => {
    const normalized = (status || "").toString().trim().toLowerCase();
    const statusMap = {
      pending: "Chờ Xác Nhận",
      waiting: "Chờ Xác Nhận",
      confirmed: "Đã Xác Nhận",
      assigned: "Đã Phân Công",
      completed: "Hoàn Thành",
      done: "Hoàn Thành",
      cancelled: "Đã Hủy",
    };
    return statusMap[normalized] || status || "Không rõ";
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "assigned", label: "Đã phân công" },
    { value: "completed", label: "Hoàn thành" },
  ];

  if (loading) {
    return (
      <div className="bookings-page">
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

        <div className="bookings-header-simple">
          <div>
            <div className="bookings-header-title">Lịch đặt trước</div>
            <div className="bookings-header-subtitle">
              Quản lý các chuyến đã được đặt lịch
            </div>
          </div>
          <button
            type="button"
            className="bookings-new-btn"
            onClick={() => setAddBookingOpen(true)}
          >
            Đặt lịch trước
          </button>
        </div>

        <div className="bookings-stats-row">
          <div className="booking-stat">
            <div className="booking-stat-label">Đã lên lịch</div>
            <div className="booking-stat-value">...</div>
          </div>
          <div className="booking-stat">
            <div className="booking-stat-label">Đã xác nhận</div>
            <div className="booking-stat-value">...</div>
          </div>
        </div>

        <div className="bookings-filters-container">
          <div className="bookings-filters-row">
            <div className="bookings-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value=""
                onChange={() => {}}
                disabled
              />
            </div>
          </div>
          <div className="bookings-filters-row">
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

        <div className="bookings-list">
          <div className="bookings-table-card">
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Lộ trình</th>
                    <th>Thời gian</th>
                    <th>Loại xe</th>
                    <th>Phân công</th>
                    <th>Hành động</th>
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
    <div className="bookings-page">
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

      <div className="bookings-header-simple">
        <div>
          <div className="bookings-header-title">Lịch đặt trước</div>
          <div className="bookings-header-subtitle">
            Quản lý các chuyến đã được đặt lịch
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

      <div className="bookings-stats-row">
        <div className="booking-stat booking-stat-1">
          <div className="booking-stat-label">Đã lên lịch</div>
          <div className="booking-stat-value">{stats.planned}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bookings-filters-container">
        <div className="bookings-filters-row">
          <div className="bookings-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>
        </div>
        <div className="bookings-filters-row">
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
          <button className="bookings-new-btn" onClick={() => setAddBookingOpen(true)}>
            + Đặt lịch mới
          </button>
        </div>
      </div>

      <div className="bookings-list">
        <div className="bookings-table-card">
          <div className="bookings-table-wrap">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Lộ trình</th>
                  <th>Thời gian</th>
                  <th>Loại xe</th>
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
                ) : bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có lịch đặt trước nào
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.tripID} className="bookings-tr">
                      <td className="bookings-td">
                        <div className="booking-customer-name">
                          {booking.customerName || "-"}
                        </div>
                        <div className="booking-customer-id">
                          ID: {booking.tripID}
                        </div>
                      </td>
                      <td className="bookings-td">
                        <div>{booking.customerPhone || "-"}</div>
                        <div className="booking-email">
                          {booking.customerEmail || "-"}
                        </div>
                      </td>
                      <td className="bookings-td">
                        <div
                          className="booking-route"
                          title={`${booking.pickupLocation || ""} → ${
                            booking.dropoffLocation || ""
                          }`}
                        >
                          {booking.pickupLocation || "-"}
                          {booking.dropoffLocation && (
                            <>
                              {" → "}
                              {booking.dropoffLocation}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="bookings-td">
                        <div>{formatDate(booking.scheduledDate)}</div>
                        <div className="booking-time">
                          {formatTime(booking.scheduledTime)}
                        </div>
                      </td>
                      <td className="bookings-td">
                        <div className="booking-vehicle-type">
                          {booking.requestedVehicleType || "-"}
                        </div>
                        {booking.requestedCargo && (
                          <div className="booking-cargo">
                            {booking.requestedCargo}
                          </div>
                        )}
                      </td>
                      <td className="bookings-td bookings-td-actions">
                        <div className="bookings-actions">
                          <button
                            className="bookings-icon-btn bookings-icon-view"
                            title="Xem chi tiáº¿t"
                            onClick={() => setSelectedBookingId(booking.tripID)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="bookings-icon-btn bookings-icon-cancel"
                            title="Há»§y lá»‹ch"
                            onClick={() => promptCancelBooking(booking.tripID)}
                          >
                            <FaBan />
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
      {selectedBookingId && (
        <BookingDetailModal
          bookingId={selectedBookingId}
          onClose={async () => {
            setSelectedBookingId(null);
            await loadBookings();
            await loadStats();
          }}
        />
      )}
      {addBookingOpen && (
        <AddBookingModal
          onClose={() => setAddBookingOpen(false)}
          onSave={handleBookingSaved}
        />
      )}
      {/* 'Đặt lịch mới' uses BookingDetailModal in create mode (bookingId === "new") */}

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmAction === "cancel"
            ? "Hủy lịch đặt trước"
            : "Xóa lịch đặt trước"
        }
        message={
          confirmAction === "cancel"
            ? "Bạn có chắc chắn muốn hủy lịch đặt trước này?"
            : "Bạn có chắc chắn muốn xóa lịch đặt trước này? Hành động này không thể hoàn tác."
        }
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}







