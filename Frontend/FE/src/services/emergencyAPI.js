// Emergency Report API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class EmergencyAPI {
  // Get all emergency reports with pagination
  async getAllReports(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || "ReportedAt",
        IsDescending: params.isDescending !== false,
        ...(params.status && { Status: params.status }),
        ...(params.level && { Level: params.level }),
      });

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/EmergencyReport?${queryParams}`,
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
      console.error("Error fetching emergency reports:", error);
      throw error;
    }
  }

  // Create new emergency report
  async createReport(reportData) {
    try {
      console.log("Sending emergency report data:", reportData); // Debug log

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/EmergencyReport`,
        {
          method: "POST",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText); // Debug log
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating emergency report:", error);
      throw error;
    }
  }

  // Respond to emergency report
  async respondToReport(responseData) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/EmergencyReport/respond`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(responseData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error responding to emergency report:", error);
      throw error;
    }
  }

  // Resolve emergency report
  async resolveReport(resolveData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/EmergencyReport/resolve`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(resolveData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error resolving emergency report:", error);
      throw error;
    }
  }

  // Get emergency report statistics
  async getStats() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/EmergencyReport/stats`,
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
      console.error("Error fetching emergency stats:", error);
      throw error;
    }
  }

  // Get emergency status options
  async getEmergencyStatuses() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/EmergencyReport/options/statuses`,
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
      console.error("Error fetching emergency statuses:", error);
      throw error;
    }
  }

  // Get emergency level options
  async getEmergencyLevels() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/EmergencyReport/options/levels`,
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
      console.error("Error fetching emergency levels:", error);
      throw error;
    }
  }
}

export default new EmergencyAPI();
