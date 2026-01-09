import "./Trade.css";
import { useState, useEffect } from "react";

const cryptoPairs = [
  { symbol: "BTC/USDT", price: 95434.95, change: 2.34, high: 96500.00, low: 94200.00, volume: "2.34B" },
  { symbol: "ETH/USDT", price: 3191.26, change: 1.56, high: 3250.00, low: 3100.00, volume: "1.23B" },
  { symbol: "BNB/USDT", price: 915.94, change: -0.89, high: 925.00, low: 910.00, volume: "456M" },
  { symbol: "SOL/USDT", price: 134.44, change: 3.21, high: 138.00, low: 132.00, volume: "789M" },
  { symbol: "XRP/USDT", price: 0.6234, change: 5.67, high: 0.65, low: 0.60, volume: "890M" },
  { symbol: "DOGE/USDT", price: 0.134, change: 1.04, high: 0.14, low: 0.13, volume: "633M" },
  { symbol: "ADA/USDT", price: 0.42, change: -1.88, high: 0.44, low: 0.41, volume: "289M" },
  { symbol: "MATIC/USDT", price: 0.114, change: -0.84, high: 0.12, low: 0.11, volume: "241M" },
];

export default function Trade() {
  const [selectedPair, setSelectedPair] = useState(cryptoPairs[0]);
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");
  const [livePrice, setLivePrice] = useState(selectedPair.price);
  
  // Get user balance from localStorage (will be from backend later)
  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem("userBalance");
    return saved ? JSON.parse(saved) : {
      USDT: 10000.00,
      BTC: 0.05,
      ETH: 0.5,
      BNB: 2.0,
      SOL: 10.0,
      XRP: 1000,
      DOGE: 5000,
      ADA: 2000,
      MATIC: 3000
    };
  });

  // Get orders history
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("tradingOrders");
    return saved ? JSON.parse(saved) : [];
  });

  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem("tradeHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOrderTab, setActiveOrderTab] = useState("open");

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => {
        const variance = (Math.random() - 0.5) * (selectedPair.price * 0.001);
        return prev + variance;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Update price when pair changes
  useEffect(() => {
    setLivePrice(selectedPair.price);
    setPrice(selectedPair.price.toString());
    setAmount("");
    setTotal("");
  }, [selectedPair]);

  // Generate chart data
  const generateChartData = () => {
    const data = [];
    let basePrice = selectedPair.price;
    for (let i = 0; i < 50; i++) {
      const variance = (Math.random() - 0.5) * (selectedPair.price * 0.02);
      basePrice += variance;
      data.push(basePrice);
    }
    return data;
  };

  const chartData = generateChartData();

  const renderChart = () => {
    const width = 800;
    const height = 400;
    const padding = 40;
    
    const max = Math.max(...chartData);
    const min = Math.min(...chartData);
    const range = max - min || 1;
    
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
    
    const color = selectedPair.change >= 0 ? '#10b981' : '#ef4444';
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="trade-chart">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (height - padding * 2) / 4)}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2) / 4)}
            stroke="#333"
            strokeWidth="1"
            strokeDasharray="4"
          />
        ))}
        
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill="url(#chartGradient)"
        />
        
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

  const handleAmountChange = (val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
      const priceVal = orderType === "market" ? livePrice : parseFloat(price);
      if (val && priceVal) {
        setTotal((parseFloat(val) * priceVal).toFixed(2));
      }
    }
  };

  const handlePriceChange = (val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setPrice(val);
      if (val && amount) {
        setTotal((parseFloat(amount) * parseFloat(val)).toFixed(2));
      }
    }
  };

  const handleTotalChange = (val) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setTotal(val);
      const priceVal = orderType === "market" ? livePrice : parseFloat(price);
      if (val && priceVal) {
        setAmount((parseFloat(val) / priceVal).toFixed(8));
      }
    }
  };

  const handlePercentage = (pct) => {
    const baseCurrency = selectedPair.symbol.split('/')[0];
    const quoteCurrency = selectedPair.symbol.split('/')[1];
    
    if (side === "buy") {
      const availableUSDT = userBalance[quoteCurrency] || 0;
      const priceVal = orderType === "market" ? livePrice : parseFloat(price) || livePrice;
      const amountToBuy = (availableUSDT * (pct / 100)) / priceVal;
      setAmount(amountToBuy.toFixed(8));
      setTotal((availableUSDT * (pct / 100)).toFixed(2));
    } else {
      const availableBase = userBalance[baseCurrency] || 0;
      const amountToSell = availableBase * (pct / 100);
      setAmount(amountToSell.toFixed(8));
      const priceVal = orderType === "market" ? livePrice : parseFloat(price) || livePrice;
      setTotal((amountToSell * priceVal).toFixed(2));
    }
  };

  const handlePlaceOrder = () => {
    const baseCurrency = selectedPair.symbol.split('/')[0];
    const quoteCurrency = selectedPair.symbol.split('/')[1];
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (orderType === "limit" && (!price || parseFloat(price) <= 0)) {
      alert("Please enter a valid price");
      return;
    }

    const executionPrice = orderType === "market" ? livePrice : parseFloat(price);
    const totalCost = parseFloat(amount) * executionPrice;

    // Check balance
    if (side === "buy") {
      if (userBalance[quoteCurrency] < totalCost) {
        alert(`Insufficient ${quoteCurrency} balance`);
        return;
      }
    } else {
      if (userBalance[baseCurrency] < parseFloat(amount)) {
        alert(`Insufficient ${baseCurrency} balance`);
        return;
      }
    }

    // Create order
    const newOrder = {
      id: Date.now(),
      pair: selectedPair.symbol,
      side: side,
      type: orderType,
      amount: parseFloat(amount),
      price: executionPrice,
      total: totalCost,
      status: orderType === "market" ? "filled" : "open",
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString()
    };

    // For market orders, execute immediately
    if (orderType === "market") {
      // Update balance
      const newBalance = { ...userBalance };
      if (side === "buy") {
        newBalance[quoteCurrency] -= totalCost;
        newBalance[baseCurrency] = (newBalance[baseCurrency] || 0) + parseFloat(amount);
      } else {
        newBalance[baseCurrency] -= parseFloat(amount);
        newBalance[quoteCurrency] += totalCost;
      }
      
      setUserBalance(newBalance);
      localStorage.setItem("userBalance", JSON.stringify(newBalance));
      
      // Add to trade history
      const newHistory = [newOrder, ...tradeHistory];
      setTradeHistory(newHistory);
      localStorage.setItem("tradeHistory", JSON.stringify(newHistory));
      
      alert(`✅ Market Order Filled!\n${side.toUpperCase()} ${amount} ${baseCurrency} @ $${executionPrice.toFixed(2)}`);
    } else {
      // For limit orders, add to open orders
      const newOrders = [newOrder, ...orders];
      setOrders(newOrders);
      localStorage.setItem("tradingOrders", JSON.stringify(newOrders));
      
      alert(`✅ Limit Order Placed!\n${side.toUpperCase()} ${amount} ${baseCurrency} @ $${executionPrice.toFixed(2)}`);
    }

    // Reset form
    setAmount("");
    setTotal("");
    if (orderType === "limit") {
      setPrice(livePrice.toString());
    }
  };

  const handleCancelOrder = (orderId) => {
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem("tradingOrders", JSON.stringify(updatedOrders));
    alert("Order cancelled");
  };

  const getAvailableBalance = () => {
    const baseCurrency = selectedPair.symbol.split('/')[0];
    const quoteCurrency = selectedPair.symbol.split('/')[1];
    
    if (side === "buy") {
      return `${(userBalance[quoteCurrency] || 0).toFixed(2)} ${quoteCurrency}`;
    } else {
      return `${(userBalance[baseCurrency] || 0).toFixed(8)} ${baseCurrency}`;
    }
  };

  return (
    <div className="trade-page">
      <div className="trade-container">
        {/* Header */}
        <div className="trade-header">
          <div className="pair-info">
            <h1>{selectedPair.symbol}</h1>
            <div className="pair-stats">
              <div className="stat">
                <span className="stat-label">Last Price</span>
                <span className="stat-value price">${livePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h Change</span>
                <span className={`stat-value ${selectedPair.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}%
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">24h High</span>
                <span className="stat-value">${selectedPair.high.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h Low</span>
                <span className="stat-value">${selectedPair.low.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">{selectedPair.volume}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="trade-grid">
          {/* Pairs List */}
          <div className="pairs-panel">
            <h3>Trading Pairs</h3>
            <div className="pairs-list">
              {cryptoPairs.map((pair) => (
                <div
                  key={pair.symbol}
                  className={`pair-item ${selectedPair.symbol === pair.symbol ? 'active' : ''}`}
                  onClick={() => setSelectedPair(pair)}
                >
                  <div className="pair-name">{pair.symbol}</div>
                  <div className="pair-price">${pair.price.toLocaleString()}</div>
                  <div className={`pair-change ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                    {pair.change >= 0 ? '+' : ''}{pair.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="chart-panel">
            <div className="chart-header">
              <div className="timeframes">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                  <button key={tf} className="timeframe-btn">{tf}</button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              {renderChart()}
            </div>
          </div>

          {/* Order Panel */}
          <div className="order-panel">
            <div className="order-tabs">
              <button
                className={side === "buy" ? "active buy" : "buy"}
                onClick={() => setSide("buy")}
              >
                Buy
              </button>
              <button
                className={side === "sell" ? "active sell" : "sell"}
                onClick={() => setSide("sell")}
              >
                Sell
              </button>
            </div>

            <div className="order-types">
              <button
                className={orderType === "limit" ? "active" : ""}
                onClick={() => setOrderType("limit")}
              >
                Limit
              </button>
              <button
                className={orderType === "market" ? "active" : ""}
                onClick={() => setOrderType("market")}
              >
                Market
              </button>
            </div>

            <div className="order-form">
              <div className="balance-info">
                <span>Available</span>
                <span>{getAvailableBalance()}</span>
              </div>

              {orderType === "limit" && (
                <div className="form-group">
                  <label>Price</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="input-suffix">USDT</span>
                  </div>
                </div>
              )}

              {orderType === "market" && (
                <div className="market-price-info">
                  <span>Market Price</span>
                  <strong>${livePrice.toFixed(2)}</strong>
                </div>
              )}

              <div className="form-group">
                <label>Amount</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="input-suffix">{selectedPair.symbol.split('/')[0]}</span>
                </div>
              </div>

              <div className="percentage-buttons">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} className="pct-btn" onClick={() => handlePercentage(pct)}>
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Total</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={total}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="input-suffix">USDT</span>
                </div>
              </div>

              <button
                className={`place-order-btn ${side}`}
                onClick={handlePlaceOrder}
              >
                {side === "buy" ? "Buy" : "Sell"} {selectedPair.symbol.split('/')[0]}
              </button>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="orders-section">
          <div className="orders-tabs">
            <button 
              className={activeOrderTab === "open" ? "active" : ""}
              onClick={() => setActiveOrderTab("open")}
            >
              Open Orders ({orders.length})
            </button>
            <button 
              className={activeOrderTab === "history" ? "active" : ""}
              onClick={() => setActiveOrderTab("history")}
            >
              Trade History ({tradeHistory.length})
            </button>
          </div>
          <div className="orders-content">
            {activeOrderTab === "open" && orders.length === 0 && (
              <div className="empty-orders">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <p>No open orders</p>
              </div>
            )}

            {activeOrderTab === "open" && orders.length > 0 && (
              <div className="orders-table">
                <div className="orders-table-header">
                  <span>Date</span>
                  <span>Pair</span>
                  <span>Side</span>
                  <span>Type</span>
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Total</span>
                  <span>Action</span>
                </div>
                {orders.map(order => (
                  <div key={order.id} className="order-row">
                    <span>{order.date}</span>
                    <span>{order.pair}</span>
                    <span className={order.side === "buy" ? "positive" : "negative"}>
                      {order.side.toUpperCase()}
                    </span>
                    <span>{order.type.toUpperCase()}</span>
                    <span>${order.price.toFixed(2)}</span>
                    <span>{order.amount.toFixed(8)}</span>
                    <span>${order.total.toFixed(2)}</span>
                    <button className="cancel-btn" onClick={() => handleCancelOrder(order.id)}>
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeOrderTab === "history" && tradeHistory.length === 0 && (
              <div className="empty-orders">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>No trade history</p>
              </div>
            )}

            {activeOrderTab === "history" && tradeHistory.length > 0 && (
              <div className="orders-table">
                <div className="orders-table-header">
                  <span>Date</span>
                  <span>Pair</span>
                  <span>Side</span>
                  <span>Type</span>
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Total</span>
                  <span>Status</span>
                </div>
                {tradeHistory.map(trade => (
                  <div key={trade.id} className="order-row">
                    <span>{trade.date}</span>
                    <span>{trade.pair}</span>
                    <span className={trade.side === "buy" ? "positive" : "negative"}>
                      {trade.side.toUpperCase()}
                    </span>
                    <span>{trade.type.toUpperCase()}</span>
                    <span>${trade.price.toFixed(2)}</span>
                    <span>{trade.amount.toFixed(8)}</span>
                    <span>${trade.total.toFixed(2)}</span>
                    <span className="status-filled">FILLED</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}