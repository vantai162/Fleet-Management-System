// API Configuration
export const API_CONFIG = {
  // Try HTTPS first, fallback to HTTP if needed
  BASE_URL: "http://localhost:5064/api", // HTTP port - more reliable for development
  // Alternative HTTPS: "https://localhost:7191/api"

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Get auth header with token
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return token
      ? {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        }
      : API_CONFIG.DEFAULT_HEADERS;
  },

  // Retry configuration for rate limiting
  RETRY_CONFIG: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 5000, // 5 seconds
  },
};

export default API_CONFIG;
