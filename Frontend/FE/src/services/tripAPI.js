import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

// Fetch paginated trips from backend and return items array
export const getTrips = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.pageNumber) query.append("pageNumber", params.pageNumber);
    if (params.pageSize) query.append("pageSize", params.pageSize);
    if (params.tripStatus) query.append("tripStatus", params.tripStatus);
    if (params.keyword) query.append("keyword", params.keyword);
    if (params.day) query.append("day", params.day);
    if (params.month) query.append("month", params.month);
    if (params.year) query.append("year", params.year);

    const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip?${query}`, {
      method: "GET",
      headers: API_CONFIG.getAuthHeaders(),
    });
    const data = await resp.json();
    // Backend returns PaginatedResult: { total, limit, page, objects: [...] }
    if (Array.isArray(data.objects)) return data.objects;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("Error fetching trips:", err);
    throw err;
  }
};

export const getTripStats = async () => {
  try {
    const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip/stats`, {
      method: "GET",
      headers: API_CONFIG.getAuthHeaders(),
    });
    const data = await resp.json();
    // Normalize PascalCase -> camelCase
    return {
      todayTrips: data.TodayTrips ?? data.todayTrips ?? data.TodayTrips,
      inProgress: data.InProgress ?? data.inProgress ?? data.InProgress,
      completed: data.Completed ?? data.completed ?? data.Completed,
      totalDistance:
        data.TotalDistance ?? data.totalDistance ?? data.TotalDistance,
    };
  } catch (err) {
    console.error("Error fetching trip stats:", err);
    throw err;
  }
};

export const getTripById = async (id) => {
  try {
    const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip/${id}`, {
      method: "GET",
      headers: API_CONFIG.getAuthHeaders(),
    });
    return await resp.json();
  } catch (err) {
    console.error("Error fetching trip by id:", err);
    throw err;
  }
};

export const getBookedTrips = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.pageNumber) query.append("pageNumber", params.pageNumber);
    if (params.pageSize) query.append("pageSize", params.pageSize);

    const resp = await fetchWithRetry(
      `${API_CONFIG.BASE_URL}/Trip/booked?${query}`,
      {
        method: "GET",
        headers: API_CONFIG.getAuthHeaders(),
      }
    );
    const data = await resp.json();
    if (Array.isArray(data.objects)) return data.objects;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("Error fetching booked trips:", err);
    throw err;
  }
};
  export const deleteTripById = async (id) => {
    try {
      const resp = await fetchWithRetry(`${API_CONFIG.BASE_URL}/Trip/${id}`, {
        method: "DELETE",
        headers: API_CONFIG.getAuthHeaders(),
      });
      return resp.ok;
    } catch (err) {
      console.error("Error deleting trip by id:", err);
      throw err;
    }
  };

