// Shared crypto assets data for entire app
export const cryptoAssets = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: 93286.07,
    change: 0.32,
    marketCap: "$1.74T",
    volume: "$8.56B",
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: 3191.26,
    change: 0.17,
    marketCap: "$353.24B",
    volume: "$3.55B",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    name: "Tether",
    symbol: "USDT",
    price: 1.00,
    change: 0,
    marketCap: "$192.30B",
    volume: "$114M",
    logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
  {
    name: "Binance Coin",
    symbol: "BNB",
    price: 915.94,
    change: 1.01,
    marketCap: "$115.68B",
    volume: "$436M",
    logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
  },
  {
    name: "Solana",
    symbol: "SOL",
    price: 134.44,
    change: 1.16,
    marketCap: "$76.08B",
    volume: "$1.07B",
    logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    price: 1.00,
    change: 0,
    marketCap: "$76.46B",
    volume: "$2.01B",
    logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    price: 0.42,
    change: -1.88,
    marketCap: "$14.6B",
    volume: "$289M",
    logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  },
  {
    name: "Tron",
    symbol: "TRX",
    price: 0.307,
    change: 1.58,
    marketCap: "$26.7B",
    volume: "$931M",
    logo: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
  },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.134,
    change: 1.04,
    marketCap: "$20.65B",
    volume: "$633M",
    logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    price: 0.114,
    change: -0.84,
    marketCap: "$1.98B",
    volume: "$241K",
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    price: 13.70,
    change: 2.03,
    marketCap: "$5.79B",
    volume: "$178M",
    logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  },
  {
    name: "Litecoin",
    symbol: "LTC",
    price: 86.07,
    change: -1.29,
    marketCap: "$6.04B",
    volume: "$761M",
    logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
  },
  {
    name: "Dash",
    symbol: "DASH",
    price: 49.51,
    change: 15.69,
    marketCap: "$570M",
    volume: "$205M",
    logo: "https://assets.coingecko.com/coins/images/19/large/dash-logo.png",
  },
  {
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.00000791,
    change: 2.11,
    marketCap: "$4.27B",
    volume: "$42.6M",
    logo: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    price: 14.21,
    change: -2.45,
    marketCap: "$8.36B",
    volume: "$322M",
    logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  },
  {
    name: "Toncoin",
    symbol: "TON",
    price: 1.75,
    change: 5.45,
    marketCap: "$8.28B",
    volume: "$59M",
    logo: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png",
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    price: 6.45,
    change: -3.12,
    marketCap: "$3.8B",
    volume: "$180M",
    logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
  },
  {
    name: "Cosmos",
    symbol: "ATOM",
    price: 9.14,
    change: 0.89,
    marketCap: "$3.4B",
    volume: "$112M",
    logo: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png",
  },
  {
    name: "Aptos",
    symbol: "APT",
    price: 7.92,
    change: 4.72,
    marketCap: "$3.1B",
    volume: "$294M",
    logo: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
  },
  {
    name: "Optimism",
    symbol: "OP",
    price: 2.04,
    change: 3.94,
    marketCap: "$2.0B",
    volume: "$178M",
    logo: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
  },
];

// Helper to format price display
export const formatPrice = (price) => {
  if (price < 0.01) return `$${price.toFixed(8)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format for MarketTabs display
export const formatForMarketTabs = () => {
  return cryptoAssets.map(asset => ({
    ...asset,
    price: formatPrice(asset.price),
    icon: asset.logo
  }));
};

// Helper to get asset by symbol
export const getAssetBySymbol = (symbol) => {
  return cryptoAssets.find(asset => asset.symbol === symbol);
};