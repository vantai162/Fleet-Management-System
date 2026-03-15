import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "./AddBookingModal.css";
import {
  buildRouteOptions,
  formatVnd,
  geocodeAddress,
  getRouteAlternatives,
  reverseGeocode,
} from "../services/routingService";
import { API_CONFIG } from "../config/api";
import { toast } from "react-toastify";

const vehicleOptions = [
  { key: "small_truck", label: "Xe tải nhỏ" },
  { key: "big_truck", label: "Xe tải lớn" },
  { key: "container", label: "Xe container" },
  { key: "bus", label: "Xe khách" },
  { key: "pickup_truck", label: "Xe bán tải" },
  { key: "car", label: "Xe con" },
];

const defaultCenter = [10.8231, 106.6297];
const pickupIcon = L.divIcon({
  className: "route-marker route-marker--pickup",
  html: '<span class="route-marker__dot">P</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});
const deliveryIcon = L.divIcon({
  className: "route-marker route-marker--delivery",
  html: '<span class="route-marker__dot">D</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (event) => onPick(event.latlng),
  });
  return null;
}

function MapAutoFit({ routeLine, markers, center }) {
  const map = useMap();

  React.useEffect(() => {
    if (routeLine.length > 0) {
      map.fitBounds(routeLine, { padding: [24, 24] });
      return;
    }
    if (markers.length > 0) {
      map.fitBounds(markers, { padding: [24, 24] });
      return;
    }
    if (center) {
      map.setView(center, 11);
    }
  }, [routeLine, markers, center, map]);

  return null;
}

export default function AddBookingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    customer: "",
    contact: "",
    email: "",
    pickup: "",
    delivery: "",
    date: "",
    time: "",
    vehicleTypeKey: "big_truck",
    passengers: "",
    vehicleNote: "",
    notes: "",
  });

  const [routes, setRoutes] = useState([]);
  const [rawRoutes, setRawRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [pickupCoord, setPickupCoord] = useState(null);
  const [deliveryCoord, setDeliveryCoord] = useState(null);
  const [activePoint, setActivePoint] = useState("pickup");
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const when = useMemo(() => {
    if (!form.date) return null;
    const time = form.time || "00:00";
    return new Date(`${form.date}T${time}`);
  }, [form.date, form.time]);

  const selectedRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || null;
  }, [routes, selectedRouteId]);

  const routeLine = useMemo(() => {
    if (!selectedRoute || !selectedRoute.geometry) return [];
    return selectedRoute.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
  }, [selectedRoute]);

  const markers = useMemo(() => {
    const list = [];
    if (pickupCoord) list.push([pickupCoord.lat, pickupCoord.lon]);
    if (deliveryCoord) list.push([deliveryCoord.lat, deliveryCoord.lon]);
    return list;
  }, [pickupCoord, deliveryCoord]);

  const handleMapPick = async (latlng) => {
    const target = activePoint || "pickup";
    const coords = { lat: latlng.lat, lon: latlng.lng };
    try {
      const address = await reverseGeocode(coords.lat, coords.lon);
      if (target === "pickup") {
        update("pickup", address);
        setPickupCoord(coords);
      } else {
        update("delivery", address);
        setDeliveryCoord(coords);
      }
    } catch (error) {
      const fallback = `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`;
      if (target === "pickup") {
        update("pickup", fallback);
        setPickupCoord(coords);
      } else {
        update("delivery", fallback);
        setDeliveryCoord(coords);
      }
    }
    setMapCenter([coords.lat, coords.lon]);
  };

  const handleLocateAddress = async (target) => {
    const query = target === "pickup" ? form.pickup : form.delivery;
    if (!query.trim()) {
      setRouteError("Vui lòng nhập địa chỉ.");
      return;
    }
    setRouteError("");
    try {
      const result = await geocodeAddress(query);
      const coords = { lat: result.lat, lon: result.lon };
      if (target === "pickup") {
        update("pickup", result.name || query);
        setPickupCoord(coords);
      } else {
        update("delivery", result.name || query);
        setDeliveryCoord(coords);
      }
      setMapCenter([coords.lat, coords.lon]);
    } catch (error) {
      setRouteError("Không thể tìm địa chỉ. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (formError == null) return;
    const clear = setTimeout(() => setFormError(null), 6000);
    return () => clearTimeout(clear);
  }, [formError]);

  const handleGenerateRoutes = async () => {
    if (!form.pickup.trim() || !form.delivery.trim()) {
      setRouteError("Vui lòng nhập điểm đầu và điểm cuối.");
      return;
    }

    setRouteError("");
    setLoadingRoutes(true);
    try {
      const [start, end] = await Promise.all([
        geocodeAddress(form.pickup),
        geocodeAddress(form.delivery),
      ]);
      const alternatives = await getRouteAlternatives(start, end);
      const options = buildRouteOptions(alternatives, form.vehicleTypeKey, when);
      setRawRoutes(alternatives);
      setRoutes(options);
      setSelectedRouteId(options[0]?.id || "");
      setPickupCoord({ lat: start.lat, lon: start.lon });
      setDeliveryCoord({ lat: end.lat, lon: end.lon });
      setMapCenter([(start.lat + end.lat) / 2, (start.lon + end.lon) / 2]);
      if (options.length === 0) {
        setRouteError("Không tìm thấy tuyến phù hợp.");
      }
    } catch (error) {
      setRouteError("Không thể tính tuyến. Vui lòng thử lại.");
      setRoutes([]);
      setSelectedRouteId("");
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    if (!rawRoutes.length) return;
    const options = buildRouteOptions(rawRoutes, form.vehicleTypeKey, when);
    setRoutes(options);
    if (options.length === 0) {
      setSelectedRouteId("");
      return;
    }
    const stillSelected = options.find((route) => route.id === selectedRouteId);
    setSelectedRouteId(stillSelected ? stillSelected.id : options[0].id);
  }, [rawRoutes, form.vehicleTypeKey, when, selectedRouteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.customer.trim() ||
      !form.contact.trim() ||
      !form.pickup.trim() ||
      !form.delivery.trim() ||
      !form.date
    ) {
      const msg = "Vui lòng nhập đầy đủ thông tin bắt buộc.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (routes.length > 0 && !selectedRoute) {
      alert("Vui lòng chọn tuyến đường.");
      return;
    }

    let scheduledIso = null;
    try {
      const time = form.time || "00:00";
      const dt = new Date(`${form.date}T${time}`);
      if (!isNaN(dt)) scheduledIso = dt.toISOString();
    } catch {}

    if (!scheduledIso) {
      const msg = "Vui lòng chọn ngày giờ hợp lệ.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setFormError(null);
      setSubmitting(true);

      const routeMeta = selectedRoute
        ? {
            distanceKm: selectedRoute.distanceKm,
            durationMin: selectedRoute.durationMin,
            geometry: selectedRoute.geometry,
          }
        : null;

      const distanceKm = Number(routeMeta?.distanceKm);
      const durationMin = Number(routeMeta?.durationMin);

      const payload = {
        CustomerName: form.customer.trim(),
        CustomerPhone: form.contact.trim(),
        CustomerEmail: form.email.trim() || null,
        StartLocation: form.pickup.trim(),
        EndLocation: form.delivery.trim(),
        RouteGeometryJson:
          routeMeta && routeMeta.geometry ? JSON.stringify(routeMeta.geometry) : null,
        EstimatedDistanceKm: Number.isFinite(distanceKm)
          ? Math.round(distanceKm)
          : null,
        EstimatedDurationMin: Number.isFinite(durationMin)
          ? Math.round(durationMin)
          : null,
        ScheduledStartTime: scheduledIso,
        VehicleID: null,
        RequestedVehicleType:
          vehicleOptions.find((item) => item.key === form.vehicleTypeKey)?.label ||
          form.vehicleTypeKey,
        RequestedPassengers: form.passengers
          ? Number(form.passengers) || null
          : null,
        RequestedCargo: form.vehicleNote.trim() || null,
        Notes: form.notes.trim() || null,
      };

      const resp = await fetch(`${API_CONFIG.BASE_URL}/Trip/booked`, {
        method: "POST",
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Không thể tạo lịch");
      }

      toast.success("Tạo lịch thành công!");
      if (onSave) await onSave();
      onClose();
    } catch (err) {
      console.error("Error creating booking:", err);
      const msg = err.message || "Lỗi khi tạo lịch";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="addbooking-overlay">
      <div className="addbooking-container">
        <h3 className="addbooking-title">Đặt lịch mới</h3>
        <form className="addbooking-form" onSubmit={handleSubmit}>
          <div className="grid two">
            <div>
              <label>Tên khách hàng</label>
              <input
                className="input"
                value={form.customer}
                onChange={(e) => update("customer", e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input
                className="input"
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
                placeholder="0901234567"
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="section">
            <h4 className="section-title">Thông tin chuyến đi</h4>
            <div className="grid two">
              <div>
                <label>Điểm đầu</label>
                <input
                  className="input"
                  value={form.pickup}
                  onChange={(e) => update("pickup", e.target.value)}
                  placeholder="Nhập điểm đầu"
                />
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => handleLocateAddress("pickup")}
                >
                  Định vị điểm đầu trên bản đồ
                </button>
              </div>
              <div>
                <label>Điểm cuối</label>
                <input
                  className="input"
                  value={form.delivery}
                  onChange={(e) => update("delivery", e.target.value)}
                  placeholder="Nhập điểm cuối"
                />
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => handleLocateAddress("delivery")}
                >
                  Định vị điểm cuối trên bản đồ
                </button>
              </div>
            </div>

            <div className="route-select mt-3">
              <span>Chọn điểm trên bản đồ:</span>
              <button
                type="button"
                className={
                  activePoint === "pickup" ? "btn-outline active" : "btn-outline"
                }
                onClick={() => setActivePoint("pickup")}
              >
                Điểm đầu
              </button>
              <button
                type="button"
                className={
                  activePoint === "delivery" ? "btn-outline active" : "btn-outline"
                }
                onClick={() => setActivePoint("delivery")}
              >
                Điểm cuối
              </button>
              <span className="route-hint">Click bản đồ để chọn điểm.</span>
            </div>

            <div className="route-map mt-2">
              <div className="route-map-frame">
                <MapContainer
                  center={defaultCenter}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="route-map-canvas"
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapAutoFit
                  routeLine={routeLine}
                  markers={markers}
                  center={mapCenter}
                />
                <MapClickHandler onPick={handleMapPick} />
                {pickupCoord && (
                  <Marker
                    position={[pickupCoord.lat, pickupCoord.lon]}
                    icon={pickupIcon}
                  />
                )}
                {deliveryCoord && (
                  <Marker
                    position={[deliveryCoord.lat, deliveryCoord.lon]}
                    icon={deliveryIcon}
                  />
                )}
                {routeLine.length > 0 && (
                  <Polyline positions={routeLine} color="#2563eb" weight={4} />
                )}
                </MapContainer>
              </div>
            </div>

            {routeError && <div className="route-error">{routeError}</div>}

            <div className="mt-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleGenerateRoutes}
                disabled={loadingRoutes}
              >
                {loadingRoutes ? "Đang tính tuyến..." : "Tạo tuyến gợi ý"}
              </button>
              <div className="route-note">
                Gợi ý tuyến dựa trên quãng đường, giao thông và chi phí ước tính.
              </div>
            </div>

            {routes.length > 0 ? (
              <div className="route-options mt-3">
                {routes.map((route) => (
                  <label key={route.id} className="route-option">
                    <input
                      type="radio"
                      name="route"
                      checked={route.id === selectedRouteId}
                      onChange={() => setSelectedRouteId(route.id)}
                    />
                    <div className="route-option-body">
                      <div className="route-option-title">
                        Tuyến {route.index + 1}: {route.distanceKm} km - {route.durationMin} phút
                      </div>
                      <div className="route-option-sub">
                        Tổng chi phí: {formatVnd(route.costs.total)}
                      </div>
                      <div className="route-option-meta">
                        Nhiên liệu: {formatVnd(route.costs.fuel)} - Cao tốc:{" "}
                        {formatVnd(route.costs.toll)} - Phà: {formatVnd(route.costs.ferry)}
                        - Thời gian: {formatVnd(route.costs.time)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Ngày đặt lịch</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
            <div>
              <label>Giờ đặt lịch</label>
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </div>
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Loại phương tiện</label>
              <select
                className="input"
                value={form.vehicleTypeKey}
                onChange={(e) => update("vehicleTypeKey", e.target.value)}
              >
                {vehicleOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Số hành khách</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={form.passengers}
                onChange={(e) => update("passengers", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Hàng hóa</label>
            <input
              className="input"
              value={form.vehicleNote}
              onChange={(e) => update("vehicleNote", e.target.value)}
              placeholder="Mô tả hàng hóa"
            />
          </div>

          <div className="mt-3">
            <label>Ghi chú</label>
            <textarea
              className="input"
              rows={4}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Ghi chú thêm về chuyến đi"
            />
          </div>

          <div className="mt-4 actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Đặt lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
