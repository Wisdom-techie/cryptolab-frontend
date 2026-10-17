import axios from 'axios';

// FIXED: Remove /api from base URL since it's already in the routes
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://cryptolab-backend-5bqm.onrender.com';

console.log('[API] Using backend URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuth');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const register = async (userData) => {
  const emailLower = userData.email.toLowerCase().trim();
  try {
    console.log('[API] Registering:', emailLower);
    const response = await apiClient.post('/api/auth/register', { ...userData, email: emailLower });
    return response;
  } catch (error) {
    console.error('[API] Register error:', error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  const emailLower = credentials.email.toLowerCase().trim();
  try {
    console.log('[API] Logging in:', emailLower);
    const response = await apiClient.post('/api/auth/login', { ...credentials, email: emailLower });
    return response;
  } catch (error) {
    console.error('[API] Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const verify2FA = async (email, code) => {
  try {
    const response = await apiClient.post('/api/auth/verify-2fa', { email, code });
    return response;
  } catch (error) {
    console.error('[API] 2FA error:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response;
  } catch (error) {
    console.error('[API] Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post('/api/auth/reset-password', { token, password });
    return response;
  } catch (error) {
    console.error('[API] Reset password error:', error);
    throw error;
  }
};

// ==================== USER API ====================

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/api/user/profile');
    return response;
  } catch (error) {
    console.error('[API] Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await apiClient.put('/api/user/profile', data);
    return response;
  } catch (error) {
    console.error('[API] Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put('/api/user/password', { currentPassword, newPassword });
    return response;
  } catch (error) {
    console.error('[API] Change password error:', error);
    throw error;
  }
};

export const getActivities = async () => {
  try {
    const response = await apiClient.get('/api/user/activities');
    return response;
  } catch (error) {
    console.error('[API] Get activities error:', error);
    throw error;
  }
};

// ==================== WALLET API ====================

export const getBalance = async () => {
  try {
    const response = await apiClient.get('/api/wallet/balance');
    return response;
  } catch (error) {
    console.error('[API] Get balance error:', error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const response = await apiClient.get('/api/wallet/transactions');
    return response;
  } catch (error) {
    console.error('[API] Get transactions error:', error);
    throw error;
  }
};

export const processDeposit = async (depositData) => {
  try {
    const response = await apiClient.post('/api/wallet/deposit', depositData);
    return response;
  } catch (error) {
    console.error('[API] Deposit error:', error);
    throw error;
  }
};

export const selfCreditDeposit = async (asset, amount) => {
  try {
    const response = await apiClient.post('/api/wallet/deposit/self-credit', { asset, amount });
    return response;
  } catch (error) {
    console.error('[API] Self credit error:', error);
    throw error;
  }
};

export const requestWithdrawal = async (withdrawalData) => {
  try {
    const response = await apiClient.post('/api/wallet/withdrawal', withdrawalData);
    return response;
  } catch (error) {
    console.error('[API] Withdrawal error:', error);
    throw error;
  }
};

// ==================== ADMIN API ====================

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/api/admin/users');
    return response;
  } catch (error) {
    console.error('[API] Get all users error:', error);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await apiClient.get('/api/admin/users/search', { params: { q: query } });
    return response;
  } catch (error) {
    console.error('[API] Search users error:', error);
    throw error;
  }
};

export const updateUserBalance = async (userId, balanceUpdate) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}/balance`, balanceUpdate);
    return response;
  } catch (error) {
    console.error('[API] Update balance error:', error);
    throw error;
  }
};

// ==================== CRYPTO API ====================

export const getLivePrices = async () => {
  try {
    console.log('🔄 Fetching live crypto prices...');
    const response = await apiClient.get('/api/crypto/prices');
    if (response.data.success && response.data.prices) {
      console.log(`✅ Successfully updated ${Object.keys(response.data.prices).length} crypto prices`);
      return {
        data: {
          prices: response.data.prices,
          timestamp: new Date().toISOString(),
          source: 'CoinGecko'
        }
      };
    }
    console.log('⚠️ Invalid price data format');
    return { data: { prices: {}, error: 'Invalid response' } };
  } catch (error) {
    console.error('[API] Price fetch error:', error);
    console.log('⚠️ No valid prices received, using static data');
    return { data: { prices: {}, error: 'Failed to fetch prices' } };
  }
};