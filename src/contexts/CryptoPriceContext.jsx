import { createContext, useContext, useState, useEffect } from 'react';
import { cryptoAPI } from '../utils/api';
import { cryptoAssets, updateCryptoAssetsWithLivePrices } from '../data/cryptoAssets';

const CryptoPriceContext = createContext();

// Hook to use crypto prices in any component
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

  // Fetch crypto prices
  const fetchPrices = async () => {
    try {
      console.log('🔄 Fetching live crypto prices...');
      const response = await cryptoAPI.getLivePrices();
      
      const livePrices = response.data.prices;
      
      // Check if we got valid price data
      const priceCount = Object.keys(livePrices).filter(
        key => livePrices[key].price > 0
      ).length;
      
      if (priceCount > 0) {
        // We got some valid prices
        setPrices(livePrices);
        
        // Update crypto assets with live prices
        const updated = updateCryptoAssetsWithLivePrices(livePrices);
        setUpdatedAssets(updated);
        
        setLastUpdate(new Date());
        setError(null);
        setIsUsingLiveData(true);
        
        console.log(`✅ Successfully updated ${priceCount} crypto prices`);
      } else {
        // No valid prices received, use static data
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
      
      // Keep using static data if API fails
      setUpdatedAssets(cryptoAssets);
    }
  };

  // Initial fetch
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      fetchPrices();
    }, 500);

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchPrices();
    }, 60000); // 60 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Helper function to get price for a symbol
  const getPrice = (symbol) => {
    if (prices[symbol]?.price > 0) {
      return prices[symbol].price;
    }
    // Fallback to static data
    const asset = cryptoAssets.find(a => a.symbol === symbol);
    return asset?.price || 0;
  };

  // Helper function to get change % for a symbol
  const getChange = (symbol) => {
    if (prices[symbol]) {
      return prices[symbol].change24h;
    }
    // Fallback to static data
    const asset = cryptoAssets.find(a => a.symbol === symbol);
    return asset?.change || 0;
  };

  // Helper function to calculate USD value
  const calculateUSD = (symbol, amount) => {
    const price = getPrice(symbol);
    return price * parseFloat(amount || 0);
  };

  // Helper function to format price
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

  // Helper function to format change with color
  const formatChange = (change) => {
    const isPositive = change >= 0;
    return {
      value: Math.abs(change).toFixed(2),
      sign: isPositive ? '+' : '-',
      color: isPositive ? '#10b981' : '#ef4444',
      className: isPositive ? 'positive' : 'negative'
    };
  };

  // Get asset with live price
  const getAsset = (symbol) => {
    return updatedAssets.find(asset => asset.symbol === symbol);
  };

  // Get all assets with live prices
  const getAllAssets = () => {
    return updatedAssets;
  };

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