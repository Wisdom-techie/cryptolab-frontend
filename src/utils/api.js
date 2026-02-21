import axios from 'axios';

// Map your crypto symbols to various API formats
const SYMBOL_MAP = {
  'BTC': { binance: 'BTCUSDT', coinbase: 'BTC-USD' },
  'ETH': { binance: 'ETHUSDT', coinbase: 'ETH-USD' },
  'USDT': { binance: 'USDTUSDT', coinbase: 'USDT-USD' },
  'BNB': { binance: 'BNBUSDT', coinbase: 'BNB-USD' },
  'SOL': { binance: 'SOLUSDT', coinbase: 'SOL-USD' },
  'USDC': { binance: 'USDCUSDT', coinbase: 'USDC-USD' },
  'ADA': { binance: 'ADAUSDT', coinbase: 'ADA-USD' },
  'TRX': { binance: 'TRXUSDT', coinbase: 'TRX-USD' },
  'DOGE': { binance: 'DOGEUSDT', coinbase: 'DOGE-USD' },
  'MATIC': { binance: 'MATICUSDT', coinbase: 'MATIC-USD' },
  'AVAX': { binance: 'AVAXUSDT', coinbase: 'AVAX-USD' },
  'LTC': { binance: 'LTCUSDT', coinbase: 'LTC-USD' },
  'DASH': { binance: 'DASHUSDT', coinbase: 'DASH-USD' },
  'SHIB': { binance: 'SHIBUSDT', coinbase: 'SHIB-USD' },
  'LINK': { binance: 'LINKUSDT', coinbase: 'LINK-USD' },
  'TON': { binance: 'TONUSDT', coinbase: 'TON-USD' },
  'UNI': { binance: 'UNIUSDT', coinbase: 'UNI-USD' },
  'ATOM': { binance: 'ATOMUSDT', coinbase: 'ATOM-USD' },
  'APT': { binance: 'APTUSDT', coinbase: 'APT-USD' },
  'OP': { binance: 'OPUSDT', coinbase: 'OP-USD' },
  'XRP': { binance: 'XRPUSDT', coinbase: 'XRP-USD' }
};

// Try Binance API first (most reliable, no CORS issues)
const fetchFromBinance = async () => {
  try {
    console.log('🔄 Trying Binance API...');
    
    const symbols = Object.keys(SYMBOL_MAP);
    const prices = {};
    
    // Fetch all prices in one request
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid Binance response');
    }
    
    // Map the response to our format
    for (const symbol of symbols) {
      const binanceSymbol = SYMBOL_MAP[symbol].binance;
      const tickerData = response.data.find(t => t.symbol === binanceSymbol);
      
      if (tickerData) {
        prices[symbol] = {
          price: parseFloat(tickerData.lastPrice) || 0,
          change24h: parseFloat(tickerData.priceChangePercent) || 0,
          marketCap: 0, // Binance doesn't provide this
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

// Fallback to CoinGecko
const fetchFromCoinGecko = async () => {
  try {
    console.log('🔄 Trying CoinGecko API...');
    
    const coinIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'USDC': 'usd-coin',
      'ADA': 'cardano',
      'TRX': 'tron',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LTC': 'litecoin',
      'DASH': 'dash',
      'SHIB': 'shiba-inu',
      'LINK': 'chainlink',
      'TON': 'the-open-network',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'APT': 'aptos',
      'OP': 'optimism',
      'XRP': 'ripple'
    };
    
    const ids = Object.values(coinIds).join(',');
    
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      }
    });
    
    const prices = {};
    
    for (const [symbol, coinId] of Object.entries(coinIds)) {
      const data = response.data[coinId];
      if (data) {
        prices[symbol] = {
          price: data.usd || 0,
          change24h: data.usd_24h_change || 0,
          marketCap: data.usd_market_cap || 0,
          volume24h: data.usd_24h_vol || 0
        };
      }
    }
    
    const validPrices = Object.keys(prices).filter(k => prices[k].price > 0).length;
    console.log(`✅ CoinGecko: Got ${validPrices} valid prices`);
    
    return prices;
  } catch (error) {
    console.error('❌ CoinGecko API failed:', error.message);
    throw error;
  }
};

// Crypto API methods
export const cryptoAPI = {
  // Get live prices with multiple fallbacks
  getLivePrices: async () => {
    let prices = {};
    let source = 'none';
    
    // Try Binance first (fastest and most reliable)
    try {
      prices = await fetchFromBinance();
      source = 'Binance';
    } catch (error) {
      console.warn('⚠️ Binance failed, trying CoinGecko...');
      
      // Try CoinGecko as fallback
      try {
        prices = await fetchFromCoinGecko();
        source = 'CoinGecko';
      } catch (error2) {
        console.error('❌ All APIs failed');
        // Return empty prices - app will use static data
        return {
          data: {
            prices: {},
            timestamp: new Date().toISOString(),
            source: 'none',
            error: 'All price APIs unavailable'
          }
        };
      }
    }
    
    // Check if we got valid prices
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
      console.warn('⚠️ No valid prices received');
      return {
        data: {
          prices: {},
          timestamp: new Date().toISOString(),
          source: 'none',
          error: 'No valid prices available'
        }
      };
    }
  },

  // Get price for a single cryptocurrency
  getSinglePrice: async (symbol) => {
    try {
      const binanceSymbol = SYMBOL_MAP[symbol]?.binance;
      if (!binanceSymbol) {
        throw new Error(`Unknown cryptocurrency: ${symbol}`);
      }

      const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`, {
        params: { symbol: binanceSymbol }
      });

      return {
        data: {
          symbol,
          price: parseFloat(response.data.lastPrice) || 0,
          change24h: parseFloat(response.data.priceChangePercent) || 0
        }
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return {
        data: {
          symbol,
          price: 0,
          change24h: 0
        }
      };
    }
  }
};

// Auth API methods - Configure your backend URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cryptolab-backend-5bqm.onrender.com';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await authAxios.post('/api/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneCode: userData.phoneCode,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        currency: userData.currency,
        password: userData.password,
        referralCode: userData.referralCode || null
      });
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('🔑 Logging in user:', credentials.email);
      const response = await authAxios.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  verify2FA: async (token, code) => {
    try {
      const response = await authAxios.post('/api/auth/verify-2fa', {
        token,
        code
      });
      return response;
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      throw error;
    }
  }
};

// Export named functions for backward compatibility
export const register = authAPI.register;
export const login = authAPI.login;
export const verify2FA = authAPI.verify2FA;
