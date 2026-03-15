// Home Dashboard API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class HomeAPI {
  // Get Top Cards stats
  async getTopCards() {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Stat/top-cards`,
        {
          method: "GET",
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching top cards:", error);
      throw error;
    }
  }
}

const homeAPIInstance = new HomeAPI();

// Export default instance (giống MaintenanceAPI)
export default homeAPIInstance;

/**
 * Export function cho code cũ / component dùng trực tiếp
 * Giữ fallback an toàn (KHÔNG dùng mock UI)
 */
export const getTopCards = async () => {
  try {
    return await homeAPIInstance.getTopCards();
  } catch (error) {
    console.error("Error loading top cards:", error);
    return [];
  }
};
