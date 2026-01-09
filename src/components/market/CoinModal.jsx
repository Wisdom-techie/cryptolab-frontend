import "./CoinModal.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Generate larger chart data
const generateChartData = (change) => {
  const points = 50;
  const data = [];
  const baseValue = 100;
  const trend = change > 0 ? 1 : -1;
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 15;
    const trendEffect = (i / points) * Math.abs(change) * trend * 2;
    const cyclical = Math.sin(i / 5) * 5;
    data.push(baseValue + variance + trendEffect + cyclical);
  }
  
  return data;
};

export default function CoinModal({ coin, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  
  const chartData = generateChartData(coin.change);

  // Get user balance (from localStorage for now, later from backend)
  const getUserBalance = () => {
    const balances = JSON.parse(localStorage.getItem("userBalance") || "{}");
    return balances[coin.symbol] || 0;
  };

  const userBalance = getUserBalance();

  // Parse price from string
  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  };

  const currentPrice = parsePrice(coin.price);
  const priceChange = currentPrice * (coin.change / 100);

  // Generate SVG line chart
  const renderChart = () => {
    const width = 600;
    const height = 200;
    const padding = 20;
    
    const max = Math.max(...chartData);
    const min = Math.min(...chartData);
    const range = max - min || 1;
    
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
    
    const color = coin.change >= 0 ? '#10b981' : '#ef4444';
    const gradientId = `gradient-${coin.symbol}`;
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="coin-chart">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#333" strokeWidth="1" strokeDasharray="4"/>
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#333" strokeWidth="1" strokeDasharray="4"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" strokeDasharray="4"/>
        
        {/* Area under line */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={`url(#${gradientId})`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Handle Deposit
  const handleDeposit = () => {
    onClose();
    navigate('/buy-crypto');
  };

  // Handle Withdraw
  const handleWithdraw = () => {
    onClose();
    navigate('/withdraw');
  };

  // Handle Trade
  const handleTrade = () => {
    onClose();
    navigate('/trade');
  };

  // Handle Quick Withdraw
  const handleQuickWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!walletAddress) {
      alert("Please enter a wallet address");
      return;
    }
    if (parseFloat(amount) > userBalance) {
      alert("Insufficient balance");
      return;
    }
    
    // In production, this would call the backend API
    alert(`Withdrawal request submitted!\n${amount} ${coin.symbol} to ${walletAddress}`);
    onClose();
    navigate('/withdraw');
  };

  return (
    <div className="coin-modal-overlay" onClick={onClose}>
      <div className="coin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="coin-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="coin-modal-header">
          <div className="coin-modal-title">
            <img src={coin.icon || coin.logo} alt={coin.symbol} />
            <div>
              <h2>{coin.name}</h2>
              <span className="coin-symbol">{coin.symbol}</span>
            </div>
          </div>

          <div className="coin-modal-price">
            <div className="price-main">
              {typeof coin.price === 'string' ? coin.price : `$${coin.price.toFixed(2)}`}
            </div>
            <div className={`price-change ${coin.change >= 0 ? 'positive' : 'negative'}`}>
              {coin.change >= 0 ? '+' : ''}
              {coin.change}% 
              <span className="price-diff">
                {coin.change >= 0 ? '+' : ''}
                ${priceChange.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="coin-modal-chart">
          {renderChart()}
        </div>

        {/* Stats */}
        <div className="coin-modal-stats">
          <div className="stat-card">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value">{coin.marketCap}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">{coin.volume}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Your Balance</span>
            <span className="stat-value">{userBalance.toFixed(8)} {coin.symbol}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="coin-modal-tabs">
          <button 
            className={activeTab === "deposit" ? "active" : ""}
            onClick={() => setActiveTab("deposit")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/>
              <polyline points="16 7 12 3 8 7"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Deposit
          </button>
          <button 
            className={activeTab === "withdraw" ? "active" : ""}
            onClick={() => setActiveTab("withdraw")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/>
              <polyline points="8 17 12 21 16 17"/>
              <line x1="12" y1="21" x2="12" y2="9"/>
            </svg>
            Withdraw
          </button>
          <button 
            className={activeTab === "trade" ? "active" : ""}
            onClick={() => setActiveTab("trade")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Trade
          </button>
        </div>

        {/* Tab Content */}
        <div className="coin-modal-content">
          {activeTab === "deposit" && (
            <div className="tab-content">
              <div className="balance-display">
                <div className="balance-item">
                  <span className="balance-label">Current Balance</span>
                  <span className="balance-value">{userBalance.toFixed(8)} {coin.symbol}</span>
                  <span className="balance-usd">${(userBalance * currentPrice).toFixed(2)} USD</span>
                </div>
              </div>
              <p className="tab-description">
                Purchase {coin.name} directly or deposit from your external wallet
              </p>
              <button className="action-btn primary" onClick={handleDeposit}>
                Deposit {coin.symbol}
              </button>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div className="tab-content">
              <div className="balance-display">
                <div className="balance-item">
                  <span className="balance-label">Available Balance</span>
                  <span className="balance-value">{userBalance.toFixed(8)} {coin.symbol}</span>
                  <span className="balance-usd">${(userBalance * currentPrice).toFixed(2)} USD</span>
                </div>
              </div>
              
              <div className="withdraw-form">
                <div className="form-group">
                  <label>Amount to Withdraw</label>
                  <input 
                    type="text" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setAmount(val);
                      }
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder={`Enter ${coin.symbol} wallet address`}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="action-buttons">
                <button className="action-btn secondary" onClick={handleWithdraw}>
                  Go to Withdraw Page
                </button>
                <button className="action-btn primary" onClick={handleQuickWithdraw}>
                  Quick Withdraw
                </button>
              </div>
            </div>
          )}

          {activeTab === "trade" && (
            <div className="tab-content">
              <div className="trade-info">
                <p>Start trading {coin.name} with advanced features</p>
                <div className="trade-features">
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span>Fast Execution</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📊</span>
                    <span>Real-time Charts</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <span>Secure Trading</span>
                  </div>
                </div>
              </div>
              <button className="action-btn primary" onClick={handleTrade}>
                Start Trading {coin.symbol}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}