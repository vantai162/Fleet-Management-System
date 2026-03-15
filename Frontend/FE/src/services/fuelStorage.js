// src/services/fuelStorage.js
// LocalStorage helpers for Fuel Management

const KEY_FUELS = "fms_fuels";
const KEY_VEHICLES = "fms_vehicles";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function getFuelRecords() {
  const raw = localStorage.getItem(KEY_FUELS);
  const data = raw ? safeParse(raw, []) : [];
  return Array.isArray(data) ? data : [];
}

export function setFuelRecords(records) {
  localStorage.setItem(KEY_FUELS, JSON.stringify(records ?? []));
}

export function getVehicles() {
  const raw = localStorage.getItem(KEY_VEHICLES);
  const data = raw ? safeParse(raw, []) : [];
  return Array.isArray(data) ? data : [];
}

export function setVehicles(vehicles) {
  localStorage.setItem(KEY_VEHICLES, JSON.stringify(vehicles ?? []));
}

export function ensureSeedVehicles() {
  const vehicles = getVehicles();
  if (vehicles.length > 0) return vehicles;

  const seeded = [
    { id: crypto.randomUUID?.() ?? String(Date.now()) + "_v1", name: "Xe 01", plate: "59A-123.45" },
    { id: crypto.randomUUID?.() ?? String(Date.now() + 1) + "_v2", name: "Xe 02", plate: "51F-678.90" },
  ];
  setVehicles(seeded);
  return seeded;
}

export function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
