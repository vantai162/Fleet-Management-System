// User API Service
import { API_CONFIG } from "../config/api";
import { fetchWithRetry } from "../utils/apiUtils";

class UserAPI {
  // Get all users with pagination
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.pageNumber)
        queryParams.append("pageNumber", params.pageNumber);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);
      if (params.role) queryParams.append("role", params.role);
      if (params.department)
        queryParams.append("department", params.department);
      if (params.keyword) queryParams.append("keyword", params.keyword);

      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/all?${queryParams}`,
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
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/${userId}`,
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
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  // Login
  async login(phone, password) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/login`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ phone, password }),
        }
      );

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          message = errorData?.error || errorData?.message || message;
        } catch {
          // ignore json parse errors
        }
        throw new Error(message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  // Register (create user)
  async register(userData) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/register`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  // Forgot password (send OTP)
  async forgotPassword(email) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/forgot-password`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending forgot password OTP:", error);
      throw error;
    }
  }

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/reset-password`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId, userData) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/${userId}`,
        {
          method: "PUT",
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Set email for first login
  async setFirstLoginEmail(phone, password, email) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/first-login/email`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ phone, password, email }),
        }
      );

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          message = errorData?.error || errorData?.message || message;
        } catch {
          // ignore json parse errors
        }
        throw new Error(message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error setting first login email:", error);
      throw error;
    }
  }

  // Upload avatar
  async uploadAvatar(userId, file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers = API_CONFIG.getAuthHeaders();
      delete headers["Content-Type"];

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/User/upload/${userId}`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  // Delete avatar
  async deleteAvatar(userId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/User/delete/${userId}`,
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
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }

  // Send OTP to email
  async sendOtp(email, purpose = "register") {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/send-otp`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ email, purpose }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOtp(email, otp, purpose = "register") {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/verify-otp`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ email, otp, purpose }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }

  // Change password after OTP verification
  async changePassword(email, newPassword) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/change-password`,
        {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({ email, newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/User/${userId}`,
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
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Get user role options
  async getUserRoles() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/User/options/roles`,
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
      console.error("Error fetching user roles:", error);
      throw error;
    }
  }

  // Get department options
  async getDepartments() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/User/options/departments`,
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
      console.error("Error fetching departments:", error);
      throw error;
    }
  }
}

const userAPIInstance = new UserAPI();
export default userAPIInstance;
