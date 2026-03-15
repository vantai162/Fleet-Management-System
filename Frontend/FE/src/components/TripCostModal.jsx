import React, { useState, useEffect } from "react";
import "./TripCostModal.css";
import { API_CONFIG } from "../config/api";
import { toast } from "react-toastify";

function formatVnd(value) {
  if (value === null || value === undefined) return "0đ";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
}

export default function TripCostModal({ trip, onClose, onAddCharge }) {
  const [type, setType] = useState("Phạt nguội");
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState("");
  const [existing, setExisting] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
 
  useEffect(() => {
    if (!trip) return;
    // Load extra expenses for this trip from backend
    const load = async () => {
      setLoadingExisting(true);
      try {
        const rawTripId = trip.tripID ?? trip.id;
        const numericTripId = (() => {
          if (rawTripId == null) return "";
          const asNum = Number(rawTripId);
          if (!isNaN(asNum) && asNum > 0) return String(asNum);
          const m = String(rawTripId).match(/(\d+)/);
          return m ? m[1] : String(rawTripId);
        })();

        const endpoints = ["ExtraExpense", "ExtraExpenses", "extraexpense", "extraexpenses"];
        let resp = null;
        let data = null;
        for (const ep of endpoints) {
          try {
            const params = new URLSearchParams();
            if (numericTripId) params.append("tripId", numericTripId);
            const url = `${API_CONFIG.BASE_URL}/${ep}?${params.toString()}`;
            resp = await fetch(url, { headers: API_CONFIG.getAuthHeaders() });
            if (resp.status === 404) {
              // try next endpoint
              continue;
            }
            if (!resp.ok) {
              console.error("Failed to load extra expenses", resp.status, await resp.text());
              resp = null;
              continue;
            }
            data = await resp.json();
            break;
          } catch (innerErr) {
            console.warn("Endpoint try failed", innerErr);
            resp = null;
            continue;
          }
        }
        if (!resp || !data) {
          setExisting([]);
          return;
        }
        const list = data.objects || data.items || data || [];
        const mapped = (list || []).map((e) => ({
          id: e.id || e.extraExpenseID || e.extraExpenseId || e.ExtraExpenseID,
          type: e.expenseType || e.ExpenseType,
          amount: formatVnd(e.amount || e.Amount || 0),
          amountNumber: e.amount || e.Amount || 0,
          desc: e.description || e.Description || "",
          date: e.expenseDate
            ? new Date(e.expenseDate).toLocaleDateString()
            : "",
        }));
        setExisting(mapped);
      } catch (err) {
        console.error("Error loading extra expenses", err);
        setExisting([]);
      } finally {
        setLoadingExisting(false);
      }
    };

    load();
  }, [trip]);

  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!trip) return;
    const amtNum = Number(amount) || 0;
    const payload = {
      tripId: trip.id || trip.tripID,
      expenseType: type,
      amount: amtNum,
      expenseDate: new Date().toISOString(),
      location: null,
      description: desc,
    };

    setSubmitting(true);
    try {
      const endpoints = ["ExtraExpense", "ExtraExpenses", "extraexpense", "extraexpenses"];
      let resp = null;
      let created = null;
      for (const ep of endpoints) {
        try {
          resp = await fetch(`${API_CONFIG.BASE_URL}/${ep}`, {
            method: "POST",
            headers: API_CONFIG.getAuthHeaders(),
            body: JSON.stringify(payload),
          });
          if (resp.status === 404 || resp.status === 405) {
            // try next endpoint variation
            continue;
          }
          if (!resp.ok) {
            const txt = await resp.text();
            console.error("Failed to create expense", resp.status, txt);
            resp = null;
            continue;
          }
          created = await resp.json();
          break;
        } catch (inner) {
          console.warn("POST attempt failed", inner);
          resp = null;
          continue;
        }
      }
      if (!resp || !created) {
        toast.error("Không thể thêm chi phí. Vui lòng thử lại.");
        return;
      }
      const createdId = created?.id;

    const newCharge = {
        id: createdId || `c${Date.now()}`,
      type,
      amount: formatVnd(amtNum),
      amountNumber: amtNum,
      desc,
      date: new Date().toLocaleDateString(),
    };

      // update UI: add to existing list and inform parent
      setExisting((prev) => [newCharge, ...(prev || [])]);
      if (onAddCharge) onAddCharge(trip.id || trip.tripID, newCharge);
      toast.success("Thêm chi phí thành công");
    setType("Phạt nguội");
    setAmount(0);
    setDesc("");
    onClose();
    } catch (err) {
      console.error("Error creating extra expense", err);
      toast.error("Lỗi khi tạo chi phí");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="trip-cost-overlay">
      <div className="trip-cost-container">
        <div className="trip-cost-header">
          <h3>Chi phí phát sinh - {trip.id}</h3>
        </div>

        <div className="trip-cost-body">
          <div className="trip-cost-section">
            <div className="section-title">Chi phí hiện có</div>
            <div className="existing-list">
              {loadingExisting ? (
                <div className="empty">Đang tải...</div>
              ) : existing.length === 0 ? (
                <div className="empty">Chưa có chi phí</div>
              ) : (
                existing.map((charge) => (
                  <div key={charge.id} className="existing-item">
                    <div className="existing-left">
                      <div className="existing-type">{charge.type}</div>
                      <div className="existing-desc">{charge.desc}</div>
                      <div className="existing-date">{charge.date}</div>
                    </div>
                    <div className="existing-amount">{charge.amount}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="trip-cost-section">
            <div className="section-title">Thêm chi phí mới</div>
            <label>Loại chi phí</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Phạt nguội</option>
              <option>Phí cầu đường</option>
              <option>Ăn uống</option>
              <option>Lưu trú</option>
              <option>Bảo trì phương tiện</option>
              <option>Khác</option>
            </select>

            <label>Số tiền (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label>Mô tả</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả chi tiết"
            />
          </div>
        </div>

        <div className="trip-cost-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            Thêm chi phí
          </button>
        </div>
      </div>
    </div>
  );
}
