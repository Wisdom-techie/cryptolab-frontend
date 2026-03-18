import axios from 'axios';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BINANCE_API = 'https://api.binance.com/api/v3';

// Crypto symbols map
const SYMBOL_MAP = {
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'USDT': 'USDTUSDT', 'BNB': 'BNBUSDT',
  'SOL': 'SOLUSDT', 'USDC': 'USDCUSDT', 'ADA': 'ADAUSDT', 'TRX': 'TRXUSDT',
  'DOGE': 'DOGEUSDT', 'MATIC': 'MATICUSDT', 'AVAX': 'AVAXUSDT', 'LTC': 'LTCUSDT',
  'DASH': 'DASHUSDT', 'SHIB': 'SHIBUSDT', 'LINK': 'LINKUSDT', 'TON': 'TONUSDT',
  'UNI': 'UNIUSDT', 'ATOM': 'ATOMUSDT', 'APT': 'APTUSDT', 'OP': 'OPUSDT', 'XRP': 'XRPUSDT'
};

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.setItem('isAuth', 'false');
      if (window.location.pathname !== '/auth') window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Fetch Binance prices
const fetchFromBinance = async () => {
  const response = await axios.get(`${BINANCE_API}/ticker/24hr`);
  const prices = {};
  
  Object.keys(SYMBOL_MAP).forEach(symbol => {
    const data = response.data.find(t => t.symbol === SYMBOL_MAP[symbol]);
    if (data) {
      prices[symbol] = {
        price: parseFloat(data.lastPrice) || 0,
        change24h: parseFloat(data.priceChangePercent) || 0,
        marketCap: 0,
        volume24h: parseFloat(data.quoteVolume) || 0
      };
    }
  });
  
  return prices;
};

// CRYPTO API
export const cryptoAPI = {
  getLivePrices: async () => {
    try {
      const prices = await fetchFromBinance();
      return {
        data: {
          prices,
          timestamp: new Date().toISOString(),
          source: 'Binance'
        }
      };
    } catch (error) {
      return {
        data: {
          prices: {},
          timestamp: new Date().toISOString(),
          source: 'none',
          error: 'API unavailable'
        }
      };
    }
  }
};

// AUTH API
export const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      localStorage.setItem('isAuth', 'true');
    }
    return response;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      localStorage.setItem('isAuth', 'true');
    }
    return response;
  },

  verify2FA: async (email, code) => {
    return await apiClient.post('/api/auth/verify-2fa', { email, code });
  },

  forgotPassword: async (email) => {
    return await apiClient.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return await apiClient.post('/api/auth/reset-password', { token, password });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.setItem('isAuth', 'false');
  }
};

// USER API
export const userAPI = {
  getProfile: async () => await apiClient.get('/api/user/profile'),
  updateProfile: async (data) => await apiClient.put('/api/user/profile', data),
  changePassword: async (currentPassword, newPassword) => {
    return await apiClient.put('/api/user/password', { currentPassword, newPassword });
  },
  enable2FA: async (code, password) => {
    return await apiClient.post('/api/user/2fa/enable', { code, password });
  },
  disable2FA: async (password) => {
    return await apiClient.post('/api/user/2fa/disable', { password });
  },
  getActivities: async () => await apiClient.get('/api/user/activities')
};

// WALLET API
export const walletAPI = {
  getBalance: async () => await apiClient.get('/api/wallet/balance'),
  getTransactions: async () => await apiClient.get('/api/wallet/transactions'),
  processDeposit: async (depositData) => {
    return await apiClient.post('/api/wallet/deposit', depositData);
  },
  requestWithdrawal: async (withdrawalData) => {
    return await apiClient.post('/api/wallet/withdraw', withdrawalData);
  }
};

// ADMIN API
export const adminAPI = {
  searchUsers: async (query) => {
    return await apiClient.get('/api/admin/users/search', { params: { q: query } });
  },
  updateUserBalance: async (userId, balanceUpdate) => {
    return await apiClient.put(`/api/admin/users/${userId}/balance`, balanceUpdate);
  },
  getAllUsers: async () => await apiClient.get('/api/admin/users'),
  getUserDetails: async (userId) => await apiClient.get(`/api/admin/users/${userId}`)
};

// Individual exports for convenience
export const searchUsers = adminAPI.searchUsers;
export const updateUserBalance = adminAPI.updateUserBalance;
export const register = authAPI.register;
export const login = authAPI.login;
export const verify2FA = authAPI.verify2FA;