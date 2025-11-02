/**
 * API Service
 * Wrapper cho fetch với error handling và logging
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Generic fetch wrapper
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, defaultOptions);
    
    console.log(`✅ API Response: ${response.status} ${url}`);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        typeof data === 'string' ? data : data.message || `HTTP ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    
    // Network error
    if (error.message === 'Failed to fetch') {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    // CORS error
    if (error.message.includes('CORS')) {
      throw new Error('Lỗi CORS. Backend chưa cho phép truy cập từ domain này.');
    }
    
    throw error;
  }
};

/**
 * Auth API
 */
export const authAPI = {
  login: (email, password) => 
    apiRequest("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
    
  register: (userData) => 
    apiRequest("/api/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
    
  forgotPassword: (email) => 
    apiRequest("/api/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
    
  resetPassword: (token, newPassword) => 
    apiRequest("/api/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

/**
 * User API
 */
export const userAPI = {
  getCurrentUser: () => apiRequest("/api/users/account/current"),
  
  updateProfile: (userId, data) => 
    apiRequest(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export default apiRequest;
