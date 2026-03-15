import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "./MaintenanceAddModal.css";

export default function MaintenanceAddModal({
  onClose,
  onSave,
  vehicles = [],
  services = [],
}) {
  const [form, setForm] = useState({
    invoiceNumber: `HD-${Math.floor(Math.random() * 90000000) + 10000000}`,
    date: new Date().toISOString().slice(0, 10),
    vehicle: "",
    maintenanceType: "Bảo dưỡng định kỳ",
    technician: "",
    workshop: "",
    services: [],
    nextDate: "",
    nextKm: "",
    notes: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const addService = () => {
    setForm((p) => ({
      ...p,
      services: [
        ...p.services,
        {
          id: Date.now(),
          serviceId: "",
          name: "",
          price: "",
          qty: 1,
        },
      ],
    }));
  };

  const updateService = (id, field, value) => {
    setForm((p) => ({
      ...p,
      services: p.services.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeService = (id) => {
    setForm((p) => ({ ...p, services: p.services.filter((s) => s.id !== id) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vehicle || !form.date || !form.maintenanceType) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Format data for API - match backend DTO exactly
    const maintenanceData = {
      VehicleID: parseInt(form.vehicle),
      MaintenanceType: form.maintenanceType,
      ScheduledDate: new Date(form.date).toISOString(),
      GarageName: form.workshop,
      TechnicianName: form.technician,
      Notes: form.notes,
      NextMaintenanceDate: form.nextDate
        ? new Date(form.nextDate).toISOString()
        : null,
      NextMaintenanceKm: form.nextKm ? parseInt(form.nextKm) : null,
      Services: form.services
        .map((service) => ({
          ServiceID: parseInt(service.serviceId || service.id),
          Quantity: parseInt(service.qty || 1),
          UnitPrice: service.price
            ? parseFloat(service.price.toString().replace(/[^\d.]/g, ""))
            : null,
        }))
        .filter((s) => s.ServiceID), // Only include services with valid ServiceID
      MaintenanceStatus: "scheduled",
    };

    console.log("Sending maintenance data:", maintenanceData); // Debug log

    if (onSave) onSave(maintenanceData);
  };

  function computeTotal(services) {
    return services.reduce((sum, s) => {
      const raw = s.price || inferPriceFromName(s.name) || "";
      const num = Number(String(raw).replace(/[^\d]/g, "")) || 0;
      const qty = Number(s.qty || 1) || 1;
      return sum + num * qty;
    }, 0);
  }

  function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
  }

  function inferPriceFromName(name) {
    if (!name) return "";
    const m = String(name).match(/(\d+)/g);
    if (!m) return "";
    return m.join("");
  }

  return (
    <div className="ma-add-overlay">
      <div className="ma-add-container">
        <h3 className="ma-add-title">Tạo hóa đơn mới</h3>
        <form className="ma-add-form" onSubmit={handleSubmit}>
          <div className="grid two">
            <div>
              <label>Số hóa đơn</label>
              <input
                className="input"
                value={form.invoiceNumber}
                onChange={(e) => update("invoiceNumber", e.target.value)}
              />
            </div>
            <div>
              <label>Ngày thực hiện *</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Phương tiện *</label>
              <select
                className="input"
                value={form.vehicle}
                onChange={(e) => update("vehicle", e.target.value)}
              >
                <option value="">-- Chọn phương tiện --</option>
                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.vehicleID || vehicle.id}
                    value={vehicle.vehicleID || vehicle.id}
                  >
                    {vehicle.licensePlate || vehicle.plate} -{" "}
                    {vehicle.vehicleModel || vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Loại bảo trì *</label>
              <select
                className="input"
                value={form.maintenanceType}
                onChange={(e) => update("maintenanceType", e.target.value)}
              >
                <option>Bảo dưỡng định kỳ</option>
                <option>Sửa chữa</option>
                <option>Thay thế linh kiện</option>
              </select>
            </div>
          </div>

          <div className="grid two mt-3">
            <div>
              <label>Kỹ thuật viên *</label>
              <input
                className="input"
                value={form.technician}
                onChange={(e) => update("technician", e.target.value)}
                placeholder="Tên kỹ thuật viên"
              />
            </div>
            <div>
              <label>Xưởng sửa chữa *</label>
              <input
                className="input"
                value={form.workshop}
                onChange={(e) => update("workshop", e.target.value)}
                placeholder="Tên xưởng"
              />
            </div>
          </div>

          <h4 className="section-title mt-4">Dịch vụ đã thực hiện</h4>
          <div className="services-list">
            {form.services.length === 0 ? (
              <div className="empty-services">
                Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.
              </div>
            ) : null}

            {form.services.map((s) => (
              <div className="service-card" key={s.id}>
                <div className="service-left">
                  <label className="service-label">Dịch vụ</label>
                  <select
                    className="input service-select"
                    value={s.serviceId || s.name}
                    onChange={(e) => {
                      const selectedService = services.find(
                        (service) => service.id == e.target.value
                      );
                      if (selectedService) {
                        updateService(s.id, "serviceId", selectedService.id);
                        updateService(s.id, "name", selectedService.name);
                        updateService(s.id, "price", selectedService.price);
                      } else {
                        updateService(s.id, "serviceId", "");
                        updateService(s.id, "name", e.target.value);
                      }
                    }}
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} -{" "}
                        {service.price
                          ? service.price.toLocaleString() + "đ"
                          : "0đ"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="service-mid">
                  <label className="service-label">Số lượng</label>
                  <input
                    className="input service-qty"
                    type="number"
                    min="1"
                    value={s.qty || 1}
                    onChange={(e) =>
                      updateService(
                        s.id,
                        "qty",
                        Math.max(1, Number(e.target.value || 1))
                      )
                    }
                  />
                </div>

                <div className="service-right">
                  <label className="service-label">Thành tiền</label>
                  <input
                    className="input service-price"
                    placeholder="Giá"
                    value={s.price || inferPriceFromName(s.name)}
                    onChange={(e) =>
                      updateService(s.id, "price", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-trash"
                    onClick={() => removeService(s.id)}
                    title="Xóa dịch vụ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-3">
              <button
                type="button"
                className="btn btn-success"
                onClick={addService}
              >
                + Thêm dịch vụ
              </button>
            </div>

            <div className="total-row">
              <div className="total-label">Tổng chi phí</div>
              <div className="total-amount">
                {formatCurrency(computeTotal(form.services))}
              </div>
            </div>
          </div>

          <h4 className="section-title mt-4">Thông tin bổ sung</h4>
          <div className="grid two">
            <div>
              <label>Ngày bảo trì tiếp theo</label>
              <input
                className="input"
                type="date"
                value={form.nextDate}
                onChange={(e) => update("nextDate", e.target.value)}
              />
            </div>
            <div>
              <label>Số km bảo trì tiếp theo</label>
              <input
                className="input"
                placeholder="VD: 15000"
                value={form.nextKm}
                onChange={(e) => update("nextKm", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Ghi chú</label>
            <textarea
              className="input"
              rows={4}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Ghi chú về bảo trì"
            />
          </div>

          <div className="mt-4 actions ma-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Tạo hóa đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
