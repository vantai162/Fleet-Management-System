import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaRoad,
  FaDollarSign,
} from "react-icons/fa";
import "./TripDetailModal.css";
import { API_CONFIG } from "../config/api";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function TripDetailModal({ tripId, onClose }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0đ";
    return value.toLocaleString("vi-VN") + "đ";
  };

  const parseRoute = (routeGeometryJson) => {
    try {
      if (!routeGeometryJson) return [];
      const parsed = JSON.parse(routeGeometryJson);
      return parsed.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );
    } catch (e) {
      console.error("Route parse error:", e);
      return [];
    }
  };

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Trip/${tripId}/orders`,
        {
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin chuyến đi");
      }

      const data = await response.json();
      setTrip(data);
      setError(null);
    } catch (err) {
      console.error("Error loading trip details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const truckIcon = new L.Icon({
    iconUrl: "/icons/truck.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const getStatusBadge = (status) => {
    const statusLower = (status || "").toString().trim().toLowerCase();
    const badges = {
      completed: { text: "Hoàn Thành", class: "status-completed" },
      "in progress": { text: "Đang Thực Hiện", class: "status-in-progress" },
      in_transit: { text: "Đang Thực Hiện", class: "status-in-progress" },
      waiting: { text: "Chờ Xử Lý", class: "status-waiting" },
      confirmed: { text: "Đã Xác Nhận", class: "status-confirmed" },
    };
    return badges[statusLower] || { text: status, class: "status-default" };
  };
  const routeLatLngs = trip?.routeGeometryJson
  ? parseRoute(trip.routeGeometryJson)
  : [];

  return (
    <div className="trip-detail-modal-overlay" onClick={onClose}>
      <div
        className="trip-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trip-detail-modal-header">
          <h2>Chi tiết chuyến đi #{tripId}</h2>
          <button className="trip-detail-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="trip-detail-modal-body">
          {loading ? (
            <div className="trip-detail-loading">
              <div className="line-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : error ? (
            <div className="trip-detail-error">{error}</div>
          ) : trip ? (
            <>
              <div className="trip-detail-section">
                <h3>Thông tin chung</h3>
                <div className="trip-detail-grid">
                  <div className="trip-detail-item">
                    <label>Khách hàng:</label>
                    <span>{trip.customer || "-"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Liên hệ:</label>
                    <span>{trip.contact || "-"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Phương tiện:</label>
                    <span>{trip.vehicle || "-"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Tài xế:</label>
                    <span>{trip.driver || "-"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Trạng thái:</label>
                    <span
                      className={`status-badge ${
                        getStatusBadge(trip.status).class
                      }`}
                    >
                      {getStatusBadge(trip.status).text}
                    </span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Chi phí nhiên liệu:</label>
                    <span className="trip-cost">{formatCurrency(trip.fuelCost) || "0đ"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Chi phí phát sinh:</label>
                    <span className="trip-cost">{formatCurrency(trip.tollCost) || "0đ"}</span>
                  </div>
                  <div className="trip-detail-item">
                    <label>Tổng chi phí:</label>
                    <span className="trip-cost">{trip.cost || "0đ"}</span>
                  </div>
                </div>
              </div>

              <div className="trip-detail-section">
                <h3>
                  <FaMapMarkerAlt /> Lộ trình
                </h3>
                <div className="trip-route">
                  <div className="trip-route-item">
                    <div className="route-marker pickup">Đ</div>
                    <div>
                      <div className="route-label">Điểm đón</div>
                      <div className="route-address">{trip.pickup || "-"}</div>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="trip-route-item">
                    <div className="route-marker dropoff">Đ</div>
                    <div>
                      <div className="route-label">Điểm trả</div>
                      <div className="route-address">{trip.dropoff || "-"}</div>
                    </div>
                  </div>
                </div>
                 {/* ===== MAP ===== */}
                  {routeLatLngs.length > 0 && (
                    <div className="trip-route-map">
                      <MapContainer
                        center={routeLatLngs[0]}
                        zoom={10}
                        style={{ height: "300px", width: "100%", borderRadius: "8px" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Polyline
                          positions={routeLatLngs}
                          pathOptions={{ color: "#007bff", weight: 5 }}
                        />

                        {/* Marker điểm đầu */}
                        <Marker position={routeLatLngs[0]} icon={truckIcon} />

                        {/* Marker điểm cuối */}
                        <Marker position={routeLatLngs[routeLatLngs.length - 1]} icon={truckIcon} />
                      </MapContainer>
                    </div>
                  )}
              </div>

              {trip.steps && trip.steps.length > 0 && (
                <div className="trip-detail-section">
                  <h3>
                    <FaClock /> Tiến trình
                  </h3>
                  <div className="trip-steps">
                    {trip.steps.map((step, index) => (
                      <div
                        key={step.key}
                        className={`trip-step ${step.done ? "done" : ""}`}
                      >
                        <div className="step-marker">
                          {step.done ? "✓" : index + 1}
                        </div>
                        <div className="step-content">
                          <div className="step-label">{step.label}</div>
                          {step.time && (
                            <div className="step-time">{step.time}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="trip-detail-error">Không tìm thấy thông tin</div>
          )}
        </div>

        <div className="trip-detail-modal-footer">
          <button className="trip-detail-btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
