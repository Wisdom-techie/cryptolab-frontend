import { createContext, useContext, useState, useEffect } from 'react';
import { getLivePrices } from '../utils/api';
import { cryptoAssets, updateCryptoAssetsWithLivePrices } from '../data/cryptoAssets';

const CryptoPriceContext = createContext();

export const useCryptoPrices = () => {
  const context = useContext(CryptoPriceContext);
  if (!context) {
    throw new Error('useCryptoPrices must be used within CryptoPriceProvider');
  }
  return context;
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
      console.log('🔄 Fetching live crypto prices...');
      const response = await getLivePrices();

      const livePrices = response.data.prices;

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
        console.log(`✅ Successfully updated ${priceCount} crypto prices`);
      } else {
        console.warn('⚠️ No valid prices received, using static data');
        setUpdatedAssets(cryptoAssets);
        setIsUsingLiveData(false);
        setError('Unable to fetch live prices. Using cached data.');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to fetch crypto prices:', err);
      setError(err.message || 'Failed to fetch live prices');
      setLoading(false);
      setIsUsingLiveData(false);
      setUpdatedAssets(cryptoAssets);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrices();
    }, 500);

    // Auto-refresh every 5 minutes to avoid CoinGecko rate limits
    const interval = setInterval(() => {
      fetchPrices();
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
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
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 0.01) {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
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

  const getAsset = (symbol) => updatedAssets.find(asset => asset.symbol === symbol);
  const getAllAssets = () => updatedAssets;

  const value = {
    prices, updatedAssets, loading, error, lastUpdate, isUsingLiveData,
    getPrice, getChange, calculateUSD, formatPrice, formatChange,
    getAsset, getAllAssets, refetch: fetchPrices
  };

  return (
    <CryptoPriceContext.Provider value={value}>
      {children}
    </CryptoPriceContext.Provider>
  );
};