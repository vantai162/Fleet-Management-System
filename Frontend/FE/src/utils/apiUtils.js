// API Utility functions
import { API_CONFIG } from "../config/api";

// Sleep function for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry fetch with exponential backoff for rate limiting
export const fetchWithRetry = async (url, options = {}, retryCount = 0) => {
  try {
    const response = await fetch(url, options);

    // If rate limited (429), retry with exponential backoff
    if (
      response.status === 429 &&
      retryCount < API_CONFIG.RETRY_CONFIG.maxRetries
    ) {
      const delay = Math.min(
        API_CONFIG.RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
        API_CONFIG.RETRY_CONFIG.maxDelay
      );

      console.log(
        `Rate limited. Retrying in ${delay}ms... (attempt ${retryCount + 1})`
      );
      await sleep(delay);
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return response;
  } catch (error) {
    // Network errors - retry once
    if (retryCount === 0) {
      console.log("Network error. Retrying once...");
      await sleep(1000);
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
};

// Cache for API responses to reduce duplicate calls
const apiCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

export const fetchWithCache = async (url, options = {}, cacheKey = null) => {
  const key = cacheKey || url;
  const now = Date.now();

  // Check cache first
  if (apiCache.has(key)) {
    const { data, timestamp } = apiCache.get(key);
    if (now - timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${key}`);
      return data;
    }
  }

  // Fetch new data
  const response = await fetchWithRetry(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the result
  apiCache.set(key, { data, timestamp: now });

  return data;
};

// Clear cache function
export const clearApiCache = () => {
  apiCache.clear();
};
