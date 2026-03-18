import axios from 'axios';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Binance API for crypto prices
const BINANCE_API = 'https://api.binance.com/api/v3';

// Map crypto symbols to Binance format
const SYMBOL_MAP = {
  'BTC': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'USDT': 'USDTUSDT',
  'BNB': 'BNBUSDT',
  'SOL': 'SOLUSDT',
  'USDC': 'USDCUSDT',
  'ADA': 'ADAUSDT',
  'TRX': 'TRXUSDT',
  'DOGE': 'DOGEUSDT',
  'MATIC': 'MATICUSDT',
  'AVAX': 'AVAXUSDT',
  'LTC': 'LTCUSDT',
  'DASH': 'DASHUSDT',
  'SHIB': 'SHIBUSDT',
  'LINK': 'LINKUSDT',
  'TON': 'TONUSDT',
  'UNI': 'UNIUSDT',
  'ATOM': 'ATOMUSDT',
  'APT': 'APTUSDT',
  'OP': 'OPUSDT',
  'XRP': 'XRPUSDT'
};

// Create axios instance for backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.setItem('isAuth', 'false');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== CRYPTO PRICE API ====================

const fetchFromBinance = async () => {
  try {
    console.log('🔄 Fetching prices from Binance...');
    
    const symbols = Object.keys(SYMBOL_MAP);
    const prices = {};
    
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid Binance response');
    }
    
    for (const symbol of symbols) {
      const binanceSymbol = SYMBOL_MAP[symbol];
      const tickerData = response.data.find(t => t.symbol === binanceSymbol);
      
      if (tickerData) {
        prices[symbol] = {
          price: parseFloat(tickerData.lastPrice) || 0,
          change24h: parseFloat(tickerData.priceChangePercent) || 0,
          marketCap: 0,
          volume24h: parseFloat(tickerData.quoteVolume) || 0
        };
      }
    }
    
    const validPrices = Object.keys(prices).filter(k => prices[k].price > 0).length;
    console.log(`✅ Binance: Got ${validPrices} valid prices`);
    
    return prices;
  } catch (error) {
    console.error('❌ Binance API failed:', error.message);
    throw error;
  }
};

export const cryptoAPI = {
  getLivePrices: async () => {
    let prices = {};
    let source = 'none';
    
    try {
      prices = await fetchFromBinance();
      source = 'Binance';
    } catch (error) {
      console.error('❌ All APIs failed');
      return {
        data: {
          prices: {},
          timestamp: new Date().toISOString(),
          source: 'none',
          error: 'All price APIs unavailable'
        }
      };
    }
    
    const validCount = Object.keys(prices).filter(k => prices[k].price > 0).length;
    
    if (validCount > 0) {
      console.log(`✅ SUCCESS: Got ${validCount} prices from ${source}`);
      return {
        data: {
          prices,
          timestamp: new Date().toISOString(),
          source
        }
      };
    } else {
      return {
        data: {
          prices: {},
          timestamp: new Date().toISOString(),
          source: 'none',
          error: 'No valid prices available'
        }
      };
    }
  }
};

// ==================== AUTH API ====================

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await apiClient.post('/api/auth/register', userData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('isAuth', 'true');
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('🔑 Logging in user:', credentials.email);
      const response = await apiClient.post('/api/auth/login', credentials);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('isAuth', 'true');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  verify2FA: async (email, code) => {
    try {
      const response = await apiClient.post('/api/auth/verify-2fa', { email, code });
      return response;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { token, password });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.setItem('isAuth', 'false');
  }
};

// ==================== USER API ====================

export const userAPI = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/api/user/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/api/user/password', { 
        currentPassword, 
        newPassword 
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  enable2FA: async (code, password) => {
    try {
      const response = await apiClient.post('/api/user/2fa/enable', { code, password });
      return response;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  },

  disable2FA: async (password) => {
    try {
      const response = await apiClient.post('/api/user/2fa/disable', { password });
      return response;
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  },

  getActivities: async () => {
    try {
      const response = await apiClient.get('/api/user/activities');
      return response;
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  }
};

// ==================== WALLET API ====================

export const walletAPI = {
  getBalance: async () => {
    try {
      const response = await apiClient.get('/api/wallet/balance');
      return response;
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/api/wallet/transactions');
      return response;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  processDeposit: async (depositData) => {
    try {
      const response = await apiClient.post('/api/wallet/deposit', depositData);
      return response;
    } catch (error) {
      console.error('Process deposit error:', error);
      throw error;
    }
  },

  requestWithdrawal: async (withdrawalData) => {
    try {
      const response = await apiClient.post('/api/wallet/withdraw', withdrawalData);
      return response;
    } catch (error) {
      console.error('Request withdrawal error:', error);
      throw error;
    }
  }
};

// ==================== ADMIN API ====================

export const adminAPI = {
  searchUsers: async (query) => {
    try {
      const response = await apiClient.get('/api/admin/users/search', {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('❌ User search error:', error);
      throw error;
    }
  },

  updateUserBalance: async (userId, balanceUpdate) => {
    try {
      const response = await apiClient.put(
        `/api/admin/users/${userId}/balance`,
        balanceUpdate
      );
      return response;
    } catch (error) {
      console.error('❌ Balance update error:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/api/admin/users');
      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  }
};

// ==================== INDIVIDUAL EXPORTS ====================

export const searchUsers = adminAPI.searchUsers;
export const updateUserBalance = adminAPI.updateUserBalance;
export const register = authAPI.register;
export const login = authAPI.login;
export const verify2FA = authAPI.verify2FA;