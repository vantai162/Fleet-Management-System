// Maintenance API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class MaintenanceAPI {
  // Get all maintenance invoices with pagination
  async getAllInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || "MaintenanceType",
        IsDescending: params.isDescending !== false,
        ...(params.keyword && {
          Keyword: params.keyword,
        }),
        ...(params.maintenanceType && {
          MaintenanceType: params.maintenanceType,
        }),
        ...(params.maintenanceStatus && {
          MaintenanceStatus: params.maintenanceStatus,
        }),
        ...(params.day && {
          Day: params.day,
        }),
        ...(params.month && {
          Month: params.month,
        }),
        ...(params.year && {
          Year: params.year,
        }),
        ...(params.minAmount && {
          MinAmount: params.minAmount,
        }),
        ...(params.maxAmount && {
          MaxAmount: params.maxAmount,
        }),
      });

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/Maintenance?${queryParams}`,
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
      console.error("Error fetching maintenance invoices:", error);
      throw error;
    }
  }

  // Get all available services
  async getAllServices() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Maintenance/services`,
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
      console.error("Error fetching maintenance services:", error);
      throw error;
    }
  }

  // Create new maintenance record
  async createMaintenance(maintenanceData) {
    try {
      console.log("Sending maintenance data:", maintenanceData); // Debug log

      const response = await fetch(`${API_CONFIG.BASE_URL}/Maintenance`, {
        method: "POST",
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(maintenanceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText); // Debug log
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating maintenance record:", error);
      throw error;
    }
  }

  // Get maintenance type options
  async getMaintenanceTypes() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Maintenance/options/types`,
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
      console.error("Error fetching maintenance types:", error);
      throw error;
    }
  }

  // Get maintenance status options
  async getMaintenanceStatuses() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Maintenance/options/statuses`,
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
      console.error("Error fetching maintenance statuses:", error);
      throw error;
    }
  }

  // Get maintenance by ID
  async getMaintenanceById(id) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Maintenance/${id}`, {
        method: "GET",
        headers: API_CONFIG.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching maintenance detail:", error);
      throw error;
    }
  }
}

const maintenanceAPIInstance = new MaintenanceAPI();

// Export both the class instance and individual functions for backward compatibility
export default maintenanceAPIInstance;

// Export individual functions that existing code expects
export const getMaintenanceRecords = async (params = {}) => {
  try {
    return await maintenanceAPIInstance.getAllInvoices(params);
  } catch (error) {
    console.error("Error loading maintenance records:", error);
    // Return empty paginated result instead of mock data
    return {
      objects: [],
      total: 0,
      page: 0,
      limit: 10,
    };
  }
};

export const getMaintenanceStats = async () => {
  try {
    const response = await fetchWithRetry(
      `${API_CONFIG.BASE_URL}/Maintenance/stats`,
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
    console.error("Error loading maintenance stats:", error);
    // Return empty stats instead of mock stats
    return {
      totalInvoices: 0,
      totalCost: "0đ",
      availableServices: 0,
      completedInvoices: 0,
      serviceStats: [],
    };
  }
};
