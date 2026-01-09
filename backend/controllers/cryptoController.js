const axios = require('axios');

// CoinGecko API base URL
const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

// Map symbols to CoinGecko IDs
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  USDC: 'usd-coin',
  ADA: 'cardano',
  TRX: 'tron',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LTC: 'litecoin',
  DASH: 'dash',
  SHIB: 'shiba-inu',
  LINK: 'chainlink',
  TON: 'the-open-network',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  APT: 'aptos',
  OP: 'optimism'
};

// @desc    Get live prices for all cryptos
exports.getLivePrices = async (req, res) => {
  try {
    const ids = Object.values(COIN_IDS).join(',');
    
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      }
    });

    // Transform data to match our format
    const prices = {};
    
    Object.entries(COIN_IDS).forEach(([symbol, id]) => {
      const data = response.data[id];
      if (data) {
        prices[symbol] = {
          symbol,
          price: data.usd,
          change24h: data.usd_24h_change || 0,
          marketCap: data.usd_market_cap || 0,
          volume24h: data.usd_24h_vol || 0
        };
      }
    });

    res.json({
      success: true,
      prices
    });
  } catch (error) {
    console.error('Get live prices error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch crypto prices',
      error: error.message 
    });
  }
};

// @desc    Get single crypto price
exports.getSinglePrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const coinId = COIN_IDS[symbol.toUpperCase()];

    if (!coinId) {
      return res.status(404).json({ message: 'Cryptocurrency not found' });
    }

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      }
    });

    const data = response.data[coinId];

    if (!data) {
      return res.status(404).json({ message: 'Price data not available' });
    }

    res.json({
      success: true,
      price: {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        marketCap: data.usd_market_cap || 0,
        volume24h: data.usd_24h_vol || 0
      }
    });
  } catch (error) {
    console.error('Get single price error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch price',
      error: error.message 
    });
  }
};

// @desc    Get market overview with detailed data
exports.getMarketOverview = async (req, res) => {
  try {
    const ids = Object.values(COIN_IDS).join(',');
    
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids,
        order: 'market_cap_desc',
        sparkline: false
      }
    });

    const markets = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      ath: coin.ath,
      atl: coin.atl
    }));

    res.json({
      success: true,
      markets
    });
  } catch (error) {
    console.error('Get market overview error:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch market data',
      error: error.message 
    });
  }
};

