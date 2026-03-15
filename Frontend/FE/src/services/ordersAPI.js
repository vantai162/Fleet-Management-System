import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

// Get orders / trip details from backend: GET /api/Trip/{tripId}/orders
export const getOrders = async (tripId) => {
  try {
    const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip/${tripId}/orders`, {
      method: "GET",
      headers: API_CONFIG.getAuthHeaders(),
    });
    const data = await resp.json();
    if (!data) return [];
    // Map backend OrderListDto to frontend expected shape
    const mapOrder = (o) => {
      return {
        id: o.Id ?? o.id ?? o.tripID ?? o.TripID,
        customer: o.Customer ?? o.customer ?? o.CustomerName ?? null,
        contact: o.Contact ?? o.contact ?? o.CustomerPhone ?? null,
        pickup: o.Pickup ?? o.pickup ?? o.StartLocation ?? null,
        dropoff: o.Dropoff ?? o.dropoff ?? o.EndLocation ?? null,
        vehicle: o.Vehicle ?? o.vehicle ?? o.Vehicle ?? null,
        driver: o.Driver ?? o.driver ?? null,
        status: o.Status ?? o.status ?? null,
        steps:
          (o.Steps ?? o.steps ?? []).map((s) => ({
            key: s.Key ?? s.key,
            label: s.Label ?? s.label,
            done: s.Done ?? s.done,
            time: s.Time ?? s.time,
          })) || [],
        cost: o.Cost ?? o.cost ?? null,
      };
    };

    // Backend returns a single OrderListDto (trip-level); also accept array
    if (Array.isArray(data)) {
      return data.map(mapOrder);
    } else {
      return [mapOrder(data)];
    }
  } catch (err) {
    console.error("Failed to get orders from backend:", err);
    throw err;
  }
};

// Confirm a step: PUT /api/Trip/{tripId}/step/{stepKey}/confirm
export const confirmOrderStep = async (tripId, stepKey) => {
  try {
    const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip/${tripId}/step/${stepKey}/confirm`, {
      method: "PUT",
      headers: API_CONFIG.getAuthHeaders(),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Confirm failed: ${resp.status} ${txt}`);
    }
    const updatedOrder = await resp.json();
    return updatedOrder;
  } catch (err) {
    console.error("Failed to confirm order step:", err);
    throw err;
  }
};
