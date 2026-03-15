// Driver API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class DriverAPI {
  // Get all drivers with pagination
  async getAllDrivers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.pageNumber)
        queryParams.append("pageNumber", params.pageNumber);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);
      if (params.driverStatus)
        queryParams.append("driverStatus", params.driverStatus);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.isDescending !== undefined)
        queryParams.append("isDescending", params.isDescending);

      // New filter params
      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.minRating) queryParams.append("minRating", params.minRating);
      if (params.maxRating) queryParams.append("maxRating", params.maxRating);
      if (params.minExperienceYears)
        queryParams.append("minExperienceYears", params.minExperienceYears);
      if (params.maxExperienceYears)
        queryParams.append("maxExperienceYears", params.maxExperienceYears);
      if (params.licenseClass)
        queryParams.append("licenseClass", params.licenseClass);

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Driver?${queryParams}`,
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
      console.error("Error fetching drivers:", error);
      throw error;
    }
  }

  // Get driver details by ID
  async getDriverDetails(driverId) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Driver/${driverId}`,
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
      console.error("Error fetching driver details:", error);
      throw error;
    }
  }

  // Get driver history
  async getDriverHistory(driverId) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Driver/${driverId}/history`,
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
      console.error("Error fetching driver history:", error);
      throw error;
    }
  }

  // Create new driver
  async createDriver(driverData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Driver`, {
        method: "POST",
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating driver:", error);
      throw error;
    }
  }

  // Update driver
  async updateDriver(driverId, driverData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Driver/${driverId}`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(driverData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error;
    }
  }

  // Delete driver
  async deleteDriver(driverId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Driver/${driverId}`,
        {
          method: "DELETE",
          headers: API_CONFIG.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting driver:", error);
      throw error;
    }
  }

  // Get driver status options
  async getDriverStatuses() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Driver/options/statuses`,
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
      console.error("Error fetching driver statuses:", error);
      throw error;
    }
  }
}

const driverAPIInstance = new DriverAPI();

// Export both the class instance and individual functions
export default driverAPIInstance;

export const getDrivers = (params) => driverAPIInstance.getAllDrivers(params);
export const getDriverDetails = (driverId) =>
  driverAPIInstance.getDriverDetails(driverId);
export const getDriverHistory = (driverId) =>
  driverAPIInstance.getDriverHistory(driverId);
export const createDriver = (driverData) =>
  driverAPIInstance.createDriver(driverData);
export const updateDriver = (driverId, driverData) =>
  driverAPIInstance.updateDriver(driverId, driverData);
export const deleteDriver = (driverId) =>
  driverAPIInstance.deleteDriver(driverId);
