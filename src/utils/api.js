import axios from 'axios';

// ==================== CONFIGURATION ====================

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BINANCE_API = 'https://api.binance.com/api/v3';

// Crypto symbol mapping
const SYMBOL_MAP = {
  BTC: 'BTCUSDT', ETH: 'ETHUSDT', USDT: 'USDTUSDT', BNB: 'BNBUSDT',
  SOL: 'SOLUSDT', USDC: 'USDCUSDT', ADA: 'ADAUSDT', TRX: 'TRXUSDT',
  DOGE: 'DOGEUSDT', MATIC: 'MATICUSDT', AVAX: 'AVAXUSDT', LTC: 'LTCUSDT',
  DASH: 'DASHUSDT', SHIB: 'SHIBUSDT', LINK: 'LINKUSDT', TON: 'TONUSDT',
  UNI: 'UNIUSDT', ATOM: 'ATOMUSDT', APT: 'APTUSDT', OP: 'OPUSDT', XRP: 'XRPUSDT'
};

// ==================== AXIOS CONFIGURATION ====================

// Create axios instance for backend API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('Unauthorized - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.setItem('isAuth', 'false');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
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
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`, { timeout: 10000 });
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid Binance response');
    }
    
    const prices = {};
    Object.entries(SYMBOL_MAP).forEach(([symbol, binanceSymbol]) => {
      const ticker = response.data.find(t => t.symbol === binanceSymbol);
      if (ticker) {
        prices[symbol] = {
          price: parseFloat(ticker.lastPrice) || 0,
          change24h: parseFloat(ticker.priceChangePercent) || 0,
          marketCap: 0,
          volume24h: parseFloat(ticker.quoteVolume) || 0
        };
      }
    });
    
    const validCount = Object.keys(prices).filter(k => prices[k].price > 0).length;
    console.log(`✅ Fetched ${validCount} prices from Binance`);
    
    return prices;
  } catch (error) {
    console.error('❌ Binance API failed:', error.message);
    throw error;
  }
};

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
      console.error('Failed to fetch crypto prices');
      return {
        data: {
          prices: {},
          timestamp: new Date().toISOString(),
          source: 'none',
          error: error.message
        }
      };
    }
  },

  getSinglePrice: async (symbol) => {
    try {
      const allPrices = await fetchFromBinance();
      return {
        data: {
          symbol,
          ...allPrices[symbol]
        }
      };
    } catch (error) {
      console.error(`Failed to fetch ${symbol} price`);
      throw error;
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
      console.error('Registration error:', error.response?.data || error.message);
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
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  verify2FA: async (email, code) => {
    try {
      const response = await apiClient.post('/api/auth/verify-2fa', { email, code });
      return response;
    } catch (error) {
      console.error('2FA verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { token, password });
      return response;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.setItem('isAuth', 'false');
    console.log('👋 User logged out');
  }
};

// ==================== USER API ====================

export const userAPI = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/api/user/profile', data);
      
      // Update local storage with new user data
      if (response.data.success && response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
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
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    }
  },

  enable2FA: async (code, password) => {
    try {
      const response = await apiClient.post('/api/user/2fa/enable', { code, password });
      return response;
    } catch (error) {
      console.error('Enable 2FA error:', error.response?.data || error.message);
      throw error;
    }
  },

  disable2FA: async (password) => {
    try {
      const response = await apiClient.post('/api/user/2fa/disable', { password });
      return response;
    } catch (error) {
      console.error('Disable 2FA error:', error.response?.data || error.message);
      throw error;
    }
  },

  getActivities: async () => {
    try {
      const response = await apiClient.get('/api/user/activities');
      return response;
    } catch (error) {
      console.error('Get activities error:', error.response?.data || error.message);
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
      console.error('Get balance error:', error.response?.data || error.message);
      throw error;
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/api/wallet/transactions');
      return response;
    } catch (error) {
      console.error('Get transactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  processDeposit: async (depositData) => {
    try {
      const response = await apiClient.post('/api/wallet/deposit', depositData);
      return response;
    } catch (error) {
      console.error('Process deposit error:', error.response?.data || error.message);
      throw error;
    }
  },

  requestWithdrawal: async (withdrawalData) => {
    try {
      const response = await apiClient.post('/api/wallet/withdraw', withdrawalData);
      return response;
    } catch (error) {
      console.error('Request withdrawal error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== ADMIN API ====================

export const adminAPI = {
  searchUsers: async (query) => {
    try {
      console.log('🔍 Searching users:', query);
      const response = await apiClient.get('/api/admin/users/search', {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('Search users error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateUserBalance: async (userId, balanceUpdate) => {
    try {
      console.log('💰 Updating balance for user:', userId);
      const response = await apiClient.put(
        `/api/admin/users/${userId}/balance`,
        balanceUpdate
      );
      return response;
    } catch (error) {
      console.error('Update balance error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/api/admin/users');
      return response;
    } catch (error) {
      console.error('Get all users error:', error.response?.data || error.message);
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user details error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllTransactions: async () => {
    try {
      const response = await apiClient.get('/api/admin/transactions');
      return response;
    } catch (error) {
      console.error('Get transactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  getPendingWithdrawals: async () => {
    try {
      const response = await apiClient.get('/api/admin/withdrawals');
      return response;
    } catch (error) {
      console.error('Get withdrawals error:', error.response?.data || error.message);
      throw error;
    }
  },

  approveDeposit: async (transactionId) => {
    try {
      const response = await apiClient.put(`/api/admin/deposit/${transactionId}/approve`);
      return response;
    } catch (error) {
      console.error('Approve deposit error:', error.response?.data || error.message);
      throw error;
    }
  },

  approveWithdrawal: async (withdrawalId, txHash) => {
    try {
      const response = await apiClient.put(
        `/api/admin/withdrawal/${withdrawalId}/approve`,
        { txHash }
      );
      return response;
    } catch (error) {
      console.error('Approve withdrawal error:', error.response?.data || error.message);
      throw error;
    }
  },

  rejectWithdrawal: async (withdrawalId, reason) => {
    try {
      const response = await apiClient.put(
        `/api/admin/withdrawal/${withdrawalId}/reject`,
        { reason }
      );
      return response;
    } catch (error) {
      console.error('Reject withdrawal error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ==================== CONVENIENCE EXPORTS ====================

export const searchUsers = adminAPI.searchUsers;
export const updateUserBalance = adminAPI.updateUserBalance;
export const register = authAPI.register;
export const login = authAPI.login;
export const verify2FA = authAPI.verify2FA;

// ==================== UTILITY FUNCTIONS ====================

export const isAuthenticated = () => {
  return localStorage.getItem('isAuth') === 'true' && !!localStorage.getItem('token');
};

export const isAdmin = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData.role === 'admin';
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    return null;
  }
};