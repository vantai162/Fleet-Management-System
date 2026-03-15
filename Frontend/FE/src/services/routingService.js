const OSRM_BASE = "https://router.project-osrm.org";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const VEHICLE_PROFILES = {
  small_truck: { fuelLPer100Km: 12, tollMultiplier: 1.0, ferryBase: 120000 },
  big_truck: { fuelLPer100Km: 18, tollMultiplier: 1.3, ferryBase: 180000 },
  container: { fuelLPer100Km: 26, tollMultiplier: 1.6, ferryBase: 240000 },
  bus: { fuelLPer100Km: 20, tollMultiplier: 1.2, ferryBase: 150000 },
};

const DEFAULT_PROFILE = VEHICLE_PROFILES.small_truck;
const FUEL_PRICE_VND = 24000;
const LABOR_COST_PER_HOUR = 80000;
const TOLL_RATE_PER_KM = 1500;

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const formatVnd = (value) => {
  const num = Math.round(toNumber(value));
  return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`;
};

const getTrafficFactor = (when) => {
  if (!when) return { factor: 1.15, label: "normal" };
  const hour = when.getHours();
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return { factor: 1.35, label: "peak" };
  }
  if (hour >= 21 || hour <= 5) {
    return { factor: 1.05, label: "night" };
  }
  return { factor: 1.2, label: "normal" };
};

export const geocodeAddress = async (query) => {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  });
  const url = `${NOMINATIM_BASE}/search?${params}`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "vi",
    },
  });
  if (!res.ok) {
    throw new Error("geocode_failed");
  }
  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error("geocode_empty");
  }
  return {
    lat: toNumber(data[0].lat),
    lon: toNumber(data[0].lon),
    name: data[0].display_name || query,
  };
};

export const reverseGeocode = async (lat, lon) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
  });
  const url = `${NOMINATIM_BASE}/reverse?${params}`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "vi",
    },
  });
  if (!res.ok) {
    throw new Error("reverse_geocode_failed");
  }
  const data = await res.json();
  return data.display_name || `${lat}, ${lon}`;
};

export const getRouteAlternatives = async (start, end) => {
  const coords = `${start.lon},${start.lat};${end.lon},${end.lat}`;
  const params = new URLSearchParams({
    alternatives: "true",
    overview: "full",
    geometries: "geojson",
    annotations: "duration,distance",
  });
  const url = `${OSRM_BASE}/route/v1/driving/${coords}?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("route_failed");
  }
  const data = await res.json();
  return data.routes || [];
};

export const estimateRouteCosts = (route, vehicleTypeKey, when) => {
  const profile = VEHICLE_PROFILES[vehicleTypeKey] || DEFAULT_PROFILE;
  const distanceKm = toNumber(route.distance) / 1000;
  const durationMin = toNumber(route.duration) / 60;
  const traffic = getTrafficFactor(when);
  const trafficDurationMin = durationMin * traffic.factor;

  const fuelCost =
    (distanceKm / 100) * profile.fuelLPer100Km * FUEL_PRICE_VND;
  const tollCost = distanceKm * TOLL_RATE_PER_KM * profile.tollMultiplier;
  const ferryCost = distanceKm > 250 ? profile.ferryBase : 0;
  const timeCost = (trafficDurationMin / 60) * LABOR_COST_PER_HOUR;

  const totalCost = fuelCost + tollCost + ferryCost + timeCost;

  return {
    distanceKm,
    durationMin,
    trafficFactor: traffic.factor,
    trafficLabel: traffic.label,
    costs: {
      fuel: fuelCost,
      toll: tollCost,
      ferry: ferryCost,
      time: timeCost,
      total: totalCost,
    },
  };
};

export const buildRouteOptions = (routes, vehicleTypeKey, when) => {
  return (routes || []).map((route, index) => {
    const estimate = estimateRouteCosts(route, vehicleTypeKey, when);
    return {
      id: `route_${index + 1}`,
      distanceKm: Math.round(estimate.distanceKm * 10) / 10,
      durationMin: Math.round(estimate.durationMin),
      trafficFactor: estimate.trafficFactor,
      trafficLabel: estimate.trafficLabel,
      costs: estimate.costs,
      geometry: route.geometry,
    };
  });
};
