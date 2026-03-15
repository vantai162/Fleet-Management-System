import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Vehicles.css";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import VehicleDetailModal from "../components/VehicleDetailModal";
import VehicleEditModal from "../components/VehicleEditModal";
import VehicleAddModal from "../components/VehicleAddModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  getVehicles,
  deleteVehicle,
  createVehicle,
} from "../services/vehicleAPI";
import vehicleAPI from "../services/vehicleAPI";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Xác nhận");

  // Stats state - tổng thể không phụ thuộc pagination
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
  });

  // Options state
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

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
    vehicleStatus: "",
    vehicleType: "",
    fuelType: "",
    vehicleBrand: "",
  });

  // Load vehicles from API
  useEffect(() => {
    loadVehicles();
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
      const [statuses, types, fuelTypes, brands] = await Promise.all([
        vehicleAPI.getVehicleStatuses(),
        vehicleAPI.getVehicleTypes(),
        vehicleAPI.getFuelTypes(),
        vehicleAPI.getVehicleBrands(),
      ]);
      setStatusOptions([
        { value: "", label: "Tất cả trạng thái" },
        ...statuses,
      ]);
      setTypeOptions([{ value: "", label: "Tất cả loại xe" }, ...types]);
      setFuelTypeOptions([
        { value: "", label: "Tất cả nhiên liệu" },
        ...fuelTypes,
      ]);
      setBrandOptions([{ value: "", label: "Tất cả hãng" }, ...brands]);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  const loadVehicles = async () => {
    try {
      setTableLoading(true);

      const data = await getVehicles({
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        vehicleStatus: filters.vehicleStatus,
        vehicleType: filters.vehicleType,
        fuelType: filters.fuelType,
        vehicleBrand: filters.vehicleBrand,
      });

      const vehiclesList = data.objects || data.items || data || [];
      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : []);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.total || vehiclesList.length || 0,
        totalPages: Math.ceil(
          (data.total || vehiclesList.length || 0) / prev.pageSize
        ),
      }));

      setError(null);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setVehicles([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load all vehicles without pagination to get accurate stats
      const data = await getVehicles({
        pageNumber: 1,
        pageSize: 9999, // Get all
      });

      const allVehicles = data.objects || data.items || data || [];

      setStats({
        total: allVehicles.length,
        available: allVehicles.filter(
          (v) =>
            (v.vehicleStatus || "").toLowerCase() === "available" ||
            (v.vehicleStatus || "") === "Sẵn sàng"
        ).length,
        inUse: allVehicles.filter(
          (v) =>
            (v.vehicleStatus || "").toLowerCase() === "in_use" ||
            (v.vehicleStatus || "") === "Đang dùng"
        ).length,
        maintenance: allVehicles.filter(
          (v) =>
            (v.vehicleStatus || "").toLowerCase() === "maintenance" ||
            (v.vehicleStatus || "") === "Bảo trì"
        ).length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleCreateVehicle = async (vehicleData) => {
    try {
      // Map form data to API format
      const apiData = {
        licensePlate: vehicleData.plate,
        vehicleType: vehicleData.type,
        vehicleBrand: vehicleData.brand,
        vehicleModel: vehicleData.model,
        manufacturedYear: Number(vehicleData.year),
        capacity: vehicleData.capacity,
        fuelType: vehicleData.fuelType,
        vehicleStatus: vehicleData.status,
        currentKm: Number(vehicleData.km),
      };

      await createVehicle(apiData);
      await loadVehicles(); // Reload to get updated data
      setShowAddModal(false);
      toast.success("Thêm phương tiện thành công!");
    } catch (err) {
      console.error("Error creating vehicle:", err);
      toast.error("Không thể thêm phương tiện. Vui lòng thử lại.");
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      setDeletingVehicleId(vehicleId);
      await deleteVehicle(vehicleId);
      // optimistic remove
      setVehicles((prev) => prev.filter((v) => v.vehicleID !== vehicleId));
      setPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - 1),
      }));
      toast.success("Xóa phương tiện thành công!");
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      toast.error("Không thể xóa phương tiện. Vui lòng thử lại.");
    } finally {
      setDeletingVehicleId(null);
    }
  };

  const promptDeleteVehicle = (vehicleId) => {
    setConfirmTarget(vehicleId);
    setConfirmTitle("Xóa phương tiện");
    setConfirmMessage("Bạn có chắc chắn muốn xóa phương tiện này?");
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
      <div className="vehicles-page">
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

        <div className="vehicles-header-simple">
          <div>
            <div className="vehicles-header-title">Quản lý phương tiện</div>
            <div className="vehicles-header-subtitle">
              Quản lý xe và thiết bị vận chuyển
            </div>
          </div>
        </div>

        <div className="vehicles-stats-row">
          <div className="vehicle-stat vehicle-stat-1">
            <div className="vehicle-stat-label">Tổng số</div>
            <div className="vehicle-stat-value">...</div>
          </div>
          <div className="vehicle-stat vehicle-stat-2">
            <div className="vehicle-stat-label">Sẵn sàng</div>
            <div className="vehicle-stat-value">...</div>
          </div>
          <div className="vehicle-stat vehicle-stat-3">
            <div className="vehicle-stat-label">Đang dùng</div>
            <div className="vehicle-stat-value">...</div>
          </div>
          <div className="vehicle-stat vehicle-stat-4">
            <div className="vehicle-stat-label">Bảo trì</div>
            <div className="vehicle-stat-value">...</div>
          </div>
        </div>

        <div className="vehicles-filters-container">
          <div className="vehicles-filters-row">
            <div className="vehicles-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm theo biển số xe..."
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
          <div className="vehicles-filters-row">
            <CustomSelect
              value=""
              onChange={() => {}}
              options={[{ value: "", label: "Tất cả loại xe" }]}
              placeholder="Tất cả loại xe"
            />
            <CustomSelect
              value=""
              onChange={() => {}}
              options={[{ value: "", label: "Tất cả nhiên liệu" }]}
              placeholder="Tất cả nhiên liệu"
            />
            <CustomSelect
              value=""
              onChange={() => {}}
              options={[{ value: "", label: "Tất cả hãng" }]}
              placeholder="Tất cả hãng"
            />
            <button className="vehicles-new-btn" disabled>
              + Thêm phương tiện
            </button>
          </div>
        </div>

        <div className="vehicles-list">
          <div className="vehicles-table-card">
            <div className="vehicles-table-wrap">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>Biển số</th>
                    <th>Loại xe</th>
                    <th>Model</th>
                    <th>Năm SX</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan="6"
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
    <div className="vehicles-page">
      <div className="vehicles-header-simple">
        <div>
          <div className="vehicles-header-title">Quản lý phương tiện</div>
          <div className="vehicles-header-subtitle">
            Quản lý xe và thiết bị vận chuyển
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

      <div className="vehicles-stats-row">
        <div className="vehicle-stat vehicle-stat-1">
          <div className="vehicle-stat-label">Tổng số</div>
          <div className="vehicle-stat-value">{stats.total}</div>
        </div>
        <div className="vehicle-stat vehicle-stat-2">
          <div className="vehicle-stat-label">Sẵn sàng</div>
          <div className="vehicle-stat-value">{stats.available}</div>
        </div>
        <div className="vehicle-stat vehicle-stat-3">
          <div className="vehicle-stat-label">Đang dùng</div>
          <div className="vehicle-stat-value">{stats.inUse}</div>
        </div>
        <div className="vehicle-stat vehicle-stat-4">
          <div className="vehicle-stat-label">Bảo trì</div>
          <div className="vehicle-stat-value">{stats.maintenance}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="vehicles-filters-container">
        <div className="vehicles-filters-row">
          <div className="vehicles-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo biển số xe..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>
          <CustomSelect
            value={filters.vehicleStatus}
            onChange={(value) => handleFilterChange("vehicleStatus", value)}
            options={statusOptions}
            placeholder="Tất cả trạng thái"
          />
        </div>
        <div className="vehicles-filters-row">
          <CustomSelect
            value={filters.vehicleType}
            onChange={(value) => handleFilterChange("vehicleType", value)}
            options={typeOptions}
            placeholder="Tất cả loại xe"
          />
          <CustomSelect
            value={filters.fuelType}
            onChange={(value) => handleFilterChange("fuelType", value)}
            options={fuelTypeOptions}
            placeholder="Tất cả nhiên liệu"
          />
          <CustomSelect
            value={filters.vehicleBrand}
            onChange={(value) => handleFilterChange("vehicleBrand", value)}
            options={brandOptions}
            placeholder="Tất cả hãng"
          />
          <button
            className="vehicles-new-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Thêm phương tiện
          </button>
        </div>
      </div>

      <div className="vehicles-list">
        <div className="vehicles-table-card">
          <div className="vehicles-table-wrap">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Biển số</th>
                  <th>Loại xe</th>
                  <th>Model</th>
                  <th>Năm SX</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="line-spinner"></div>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#6b7280",
                      }}
                    >
                      Không có phương tiện nào
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.vehicleID} className="vehicles-tr">
                      <td className="vehicles-td">
                        <div className="vehicles-plate-text">
                          {vehicle.licensePlate}
                        </div>
                      </td>
                      <td className="vehicles-td">
                        <div
                          className="vehicles-type-text"
                          title={vehicle.vehicleType}
                        >
                          {vehicle.vehicleType?.length > 20
                            ? `${vehicle.vehicleType.substring(0, 20)}...`
                            : vehicle.vehicleType || "-"}
                        </div>
                      </td>
                      <td className="vehicles-td">
                        <div
                          className="vehicles-model-text"
                          title={vehicle.vehicleModel}
                        >
                          {vehicle.vehicleModel?.length > 25
                            ? `${vehicle.vehicleModel.substring(0, 25)}...`
                            : vehicle.vehicleModel || "-"}
                        </div>
                      </td>
                      <td className="vehicles-td">
                        <div className="vehicles-year-text">
                          {vehicle.manufacturedYear || "-"}
                        </div>
                      </td>
                      <td className="vehicles-td">
                        <span
                          className={`vehicles-status-badge status-${(
                            vehicle.vehicleStatus || "unknown"
                          )
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/đ/g, "d")
                            .replace(/\s+/g, "_")}`}
                        >
                          {(() => {
                            const status = vehicle.vehicleStatus || "";
                            if (status === "available" || status === "Sẵn sàng")
                              return "Sẵn sàng";
                            if (status === "in_use" || status === "Đang dùng")
                              return "Đang dùng";
                            if (
                              status === "maintenance" ||
                              status === "Bảo trì"
                            )
                              return "Bảo trì";
                            return status || "Không rõ";
                          })()}
                        </span>
                      </td>
                      <td className="vehicles-td vehicles-td-actions">
                        <div className="vehicles-actions">
                          <button
                            className="vehicles-icon-btn vehicles-icon-view"
                            title="Xem chi tiết"
                            onClick={() =>
                              setSelectedVehicleId(vehicle.vehicleID)
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            className="vehicles-icon-btn vehicles-icon-edit"
                            title="Chỉnh sửa"
                            onClick={() =>
                              setEditingVehicleId(vehicle.vehicleID)
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="vehicles-icon-btn vehicles-icon-delete"
                            title="Xóa"
                            onClick={() =>
                              promptDeleteVehicle(vehicle.vehicleID)
                            }
                            disabled={deletingVehicleId === vehicle.vehicleID}
                          >
                            {deletingVehicleId === vehicle.vehicleID ? (
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

      {selectedVehicleId && (
        <VehicleDetailModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}

      {editingVehicleId && (
        <VehicleEditModal
          vehicleId={editingVehicleId}
          onClose={() => setEditingVehicleId(null)}
          onSave={async () => {
            setEditingVehicleId(null);
            await loadVehicles();
            toast.success("Cập nhật phương tiện thành công!");
          }}
        />
      )}

      {showAddModal && (
        <VehicleAddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateVehicle}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={() => {
          if (confirmTarget) {
            handleDeleteVehicle(confirmTarget);
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
