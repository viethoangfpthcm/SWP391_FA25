/**
 * API Configuration
 * Sử dụng Vite proxy trong development, direct URL trong production
 */

// Use global variable injected by Vite define plugin
// This ensures API_BASE_URL is always defined, even with module loading issues
const _API_BASE_URL = typeof __API_BASE_URL__ !== 'undefined' 
    ? __API_BASE_URL__ 
    : "https://103.90.226.216:8443";

// Export as function to avoid timing issues with module loading
export const getApiBaseUrl = () => _API_BASE_URL;

// Export as constant for backward compatibility
export const API_BASE_URL = _API_BASE_URL;

// Alias for backward compatibility
export const API_BASE = _API_BASE_URL;

// Các endpoints thường dùng
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/users/login",
  REGISTER: "/api/users/register",
  FORGOT_PASSWORD: "/api/users/forgot-password",
  RESET_PASSWORD: "/api/users/reset-password",
  
  // Admin
  ADMIN_SERVICE_CENTERS: "/api/admin/service-centers",
  ADMIN_PARTS: "/api/admin/parts",
  ADMIN_BOOKINGS: "/api/admin/bookings",
  ADMIN_PAYMENTS: "/api/admin/payments",
  ADMIN_ANALYTICS: "/api/admin/analytics",
  
  // Customer
  CUSTOMER_DASHBOARD: "/api/customer/dashboard",
  CUSTOMER_VEHICLES: "/api/customer/vehicles",
  CUSTOMER_BOOKINGS: "/api/customer/bookings",
  
  // Staff
  STAFF_DASHBOARD: "/api/staff/dashboard",
  STAFF_CHECKLISTS: "/api/staff/checklists",
  
  // Technician
  TECHNICIAN_TASKS: "/api/technician/my-checklists",
  TECHNICIAN_COMPLETE: "/api/technician/complete",
  
  // Payment
  PAYMENT_VNPAY: "/api/payment/vnpay",
  PAYMENT_RESULT: "/api/payment/result",
};

/**
 * Helper function để tạo full URL
 * @param {string} endpoint - API endpoint
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;
