import "./MarketTable.css";
import { useState } from "react";
import CoinModal from "./CoinModal";

// Generate mini chart data for sparklines
const generateSparklineData = (change) => {
  const points = 20;
  const data = [];
  const baseValue = 50;
  const trend = change > 0 ? 1 : -1;
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 10;
    const trendEffect = (i / points) * Math.abs(change) * trend;
    data.push(baseValue + variance + trendEffect);
  }
  
  return data;
};

// Mini sparkline chart component
const Sparkline = ({ data, change }) => {
  const width = 100;
  const height = 40;
  const padding = 2;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');
  
  const color = change >= 0 ? '#10b981' : '#ef4444';
  
  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function MarketTable({ title, data }) {
  const [selectedCoin, setSelectedCoin] = useState(null);

  if (!data || data.length === 0) {
    return <p style={{ padding: "1rem", color: "#9ca3af" }}>No data available.</p>;
  }

  const handleRowClick = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <>
      <section className="market-section">
        {title && <h2>{title}</h2>}

        <div className="market-table">
          <div className="market-header">
            <span>Token</span>
            <span>Price</span>
            <span>24h</span>
            <span>Chart (7D)</span>
            <span>Market Cap</span>
            <span>Volume</span>
          </div>

          {data.map((coin) => {
            const sparklineData = generateSparklineData(coin.change);
            
            return (
              <div 
                className="market-row" 
                key={coin.symbol}
                onClick={() => handleRowClick(coin)}
              >
                <div className="coin">
                  <img src={coin.icon} alt={coin.symbol} />
                  <div>
                    <strong>{coin.symbol}</strong>
                    <small>{coin.name}</small>
                  </div>
                </div>

                <span className="price">{coin.price}</span>

                <span className={coin.change >= 0 ? "positive" : "negative"}>
                  {coin.change >= 0 ? "+" : ""}
                  {coin.change}%
                </span>

                <div className="chart-cell">
                  <Sparkline data={sparklineData} change={coin.change} />
                </div>

                <span className="market-cap">{coin.marketCap}</span>
                <span className="volume">{coin.volume}</span>
              </div>
            );
          })}
        </div>
      </section>

      {selectedCoin && (
        <CoinModal 
          coin={selectedCoin} 
          onClose={() => setSelectedCoin(null)} 
        />
      )}
    </>
  );
}