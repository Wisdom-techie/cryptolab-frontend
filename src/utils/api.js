import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verify2FA: (code) => api.post('/auth/verify-2fa', { code })
};

// ==================== USER ENDPOINTS ====================
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  uploadAvatar: (formData) => api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/user/avatar'),
  changePassword: (data) => api.put('/user/password', data),
  enable2FA: (data) => api.post('/user/2fa/enable', data),
  disable2FA: (data) => api.post('/user/2fa/disable', data),
  change2FA: (data) => api.put('/user/2fa/change', data),
  getActivities: () => api.get('/user/activities'),
  getSessions: () => api.get('/user/sessions')
};

// ==================== WALLET ENDPOINTS ====================
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  processDeposit: (data) => api.post('/wallet/deposit', data),
  requestWithdrawal: (data) => api.post('/wallet/withdrawal', data)
};

// ==================== CRYPTO ENDPOINTS ====================
export const cryptoAPI = {
  getLivePrices: () => api.get('/crypto/prices'),
  getSinglePrice: (symbol) => api.get(`/crypto/price/${symbol}`),
  getMarketOverview: () => api.get('/crypto/markets')
};

// ==================== ADMIN ENDPOINTS ====================
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getAllTransactions: () => api.get('/admin/transactions'),
  getPendingWithdrawals: () => api.get('/admin/withdrawals'),
  approveDeposit: (id) => api.put(`/admin/deposit/${id}/approve`),
  approveWithdrawal: (id, txHash) => api.put(`/admin/withdrawal/${id}/approve`, { txHash }),
  rejectWithdrawal: (id, reason) => api.put(`/admin/withdrawal/${id}/reject`, { reason })
};

// ==================== TRADE ENDPOINTS (Placeholder) ====================
export const tradeAPI = {
  createOrder: (data) => api.post('/trade/order', data),
  getOrders: () => api.get('/trade/orders'),
  cancelOrder: (id) => api.delete(`/trade/order/${id}`)
};

// Legacy exports for backward compatibility
export const register = authAPI.register;
export const login = authAPI.login;
export const verify2FA = authAPI.verify2FA;
export const forgotPassword = authAPI.forgotPassword;
export const resetPassword = authAPI.resetPassword;
export const getCryptoPrices = cryptoAPI.getLivePrices;
export const getBalance = walletAPI.getBalance;

export default api;