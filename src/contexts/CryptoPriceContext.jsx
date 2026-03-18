import { createContext, useContext, useState, useEffect } from 'react';
import { cryptoAssets, updateCryptoAssetsWithLivePrices } from '../data/cryptoAssets';
import axios from 'axios';

const CryptoPriceContext = createContext();

export const useCryptoPrices = () => {
  const context = useContext(CryptoPriceContext);
  if (!context) {
    throw new Error('useCryptoPrices must be used within CryptoPriceProvider');
  }
  return context;
};

// Direct Binance fetch - no dependencies
const fetchPricesDirectly = async () => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    
    const symbolMap = {
      'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'USDT': 'USDTUSDT', 'BNB': 'BNBUSDT',
      'SOL': 'SOLUSDT', 'USDC': 'USDCUSDT', 'ADA': 'ADAUSDT', 'TRX': 'TRXUSDT',
      'DOGE': 'DOGEUSDT', 'MATIC': 'MATICUSDT', 'AVAX': 'AVAXUSDT', 'LTC': 'LTCUSDT',
      'DASH': 'DASHUSDT', 'SHIB': 'SHIBUSDT', 'LINK': 'LINKUSDT', 'TON': 'TONUSDT',
      'UNI': 'UNIUSDT', 'ATOM': 'ATOMUSDT', 'APT': 'APTUSDT', 'OP': 'OPUSDT', 'XRP': 'XRPUSDT'
    };
    
    const prices = {};
    Object.entries(symbolMap).forEach(([symbol, binanceSymbol]) => {
      const data = response.data.find(t => t.symbol === binanceSymbol);
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
  } catch (error) {
    console.error('❌ Binance fetch failed:', error);
    throw error;
  }
};

export const CryptoPriceProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [updatedAssets, setUpdatedAssets] = useState(cryptoAssets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);

  const fetchPrices = async () => {
    try {
      console.log('🔄 Fetching live prices...');
      const livePrices = await fetchPricesDirectly();
      
      const priceCount = Object.keys(livePrices).filter(
        key => livePrices[key].price > 0
      ).length;
      
      if (priceCount > 0) {
        setPrices(livePrices);
        const updated = updateCryptoAssetsWithLivePrices(livePrices);
        setUpdatedAssets(updated);
        setLastUpdate(new Date());
        setError(null);
        setIsUsingLiveData(true);
        console.log(`✅ Got ${priceCount} live prices`);
      } else {
        throw new Error('No valid prices');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed:', err.message);
      setError(err.message);
      setLoading(false);
      setIsUsingLiveData(false);
      setUpdatedAssets(cryptoAssets);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPrice = (symbol) => {
    if (prices[symbol]?.price > 0) return prices[symbol].price;
    const asset = cryptoAssets.find(a => a.symbol === symbol);
    return asset?.price || 0;
  };

  const getChange = (symbol) => {
    if (prices[symbol]) return prices[symbol].change24h;
    const asset = cryptoAssets.find(a => a.symbol === symbol);
    return asset?.change || 0;
  };

  const calculateUSD = (symbol, amount) => {
    return getPrice(symbol) * parseFloat(amount || 0);
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1) {
      return '$' + price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (price >= 0.01) {
      return '$' + price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      });
    } else {
      return '$' + price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      });
    }
  };

  const formatChange = (change) => {
    const isPositive = change >= 0;
    return {
      value: Math.abs(change).toFixed(2),
      sign: isPositive ? '+' : '-',
      color: isPositive ? '#10b981' : '#ef4444',
      className: isPositive ? 'positive' : 'negative'
    };
  };

  const getAsset = (symbol) => {
    return updatedAssets.find(asset => asset.symbol === symbol);
  };

  const getAllAssets = () => updatedAssets;

  const value = {
    prices,
    updatedAssets,
    loading,
    error,
    lastUpdate,
    isUsingLiveData,
    getPrice,
    getChange,
    calculateUSD,
    formatPrice,
    formatChange,
    getAsset,
    getAllAssets,
    refetch: fetchPrices
  };

  return (
    <CryptoPriceContext.Provider value={value}>
      {children}
    </CryptoPriceContext.Provider>
  );
};