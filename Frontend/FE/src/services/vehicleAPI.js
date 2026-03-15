// Vehicle API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class VehicleAPI {
  // Get all vehicles with pagination
  async getAllVehicles(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.pageNumber)
        queryParams.append("pageNumber", params.pageNumber);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);
      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.vehicleStatus)
        queryParams.append("vehicleStatus", params.vehicleStatus);
      if (params.vehicleType)
        queryParams.append("vehicleType", params.vehicleType);
      if (params.fuelType) queryParams.append("fuelType", params.fuelType);
      if (params.vehicleBrand)
        queryParams.append("vehicleBrand", params.vehicleBrand);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.isDescending !== undefined)
        queryParams.append("isDescending", params.isDescending);

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Vehicle?${queryParams}`,
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
      console.error("Error fetching vehicles:", error);
      throw error;
    }
  }

  // Get vehicle details by ID
  async getVehicleDetails(vehicleId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/${vehicleId}`,
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
      console.error("Error fetching vehicle details:", error);
      throw error;
    }
  }

  // Create new vehicle
  async createVehicle(vehicleData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Vehicle`, {
        method: "POST",
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error;
    }
  }

  // Update vehicle
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/${vehicleId}`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(vehicleData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  }

  // Delete vehicle
  async deleteVehicle(vehicleId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/${vehicleId}`,
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
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  }

  // Get vehicle status options
  async getVehicleStatuses() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/options/statuses`,
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
      console.error("Error fetching vehicle statuses:", error);
      throw error;
    }
  }

  // Get vehicle type options
  async getVehicleTypes() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/options/types`,
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
      console.error("Error fetching vehicle types:", error);
      throw error;
    }
  }

  // Get fuel type options
  async getFuelTypes() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/options/fuel-types`,
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
      console.error("Error fetching fuel types:", error);
      throw error;
    }
  }

  // Get vehicle brand options
  async getVehicleBrands() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Vehicle/options/brands`,
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
      console.error("Error fetching vehicle brands:", error);
      throw error;
    }
  }
}

const vehicleAPIInstance = new VehicleAPI();

// Export both the class instance and individual functions for backward compatibility
export default vehicleAPIInstance;

// Export individual functions that existing code expects
export const getVehicles = (params) =>
  vehicleAPIInstance.getAllVehicles(params);
export const getVehicleDetails = (vehicleId) =>
  vehicleAPIInstance.getVehicleDetails(vehicleId);
export const createVehicle = (vehicleData) =>
  vehicleAPIInstance.createVehicle(vehicleData);
export const updateVehicle = (vehicleId, vehicleData) =>
  vehicleAPIInstance.updateVehicle(vehicleId, vehicleData);
export const deleteVehicle = (vehicleId) =>
  vehicleAPIInstance.deleteVehicle(vehicleId);
