import { useState } from "react";
import MarketTable from "./MarketTable";
import "./MarketTabs.css";
import { useCryptoPrices } from "../../contexts/CryptoPriceContext";
import { formatForMarketTabs } from "../../data/cryptoAssets";

export default function MarketTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Get live crypto prices from context
  const { 
    getAllAssets, 
    loading, 
    error, 
    lastUpdate, 
    isUsingLiveData,
    refetch 
  } = useCryptoPrices();

  // Get all markets with live prices
  const allMarkets = formatForMarketTabs(getAllAssets());

  // Filter gainers
  const gainers = [...allMarkets]
    .filter((c) => c.change > 0)
    .sort((a, b) => b.change - a.change);

  // Filter losers
  const losers = [...allMarkets]
    .filter((c) => c.change < 0)
    .sort((a, b) => a.change - b.change);

  const getMarketData = () => {
    switch (activeTab) {
      case "gainers":
        return { title: "Top Gainers", data: gainers };
      case "losers":
        return { title: "Top Losers", data: losers };
      default:
        return { title: "All Markets", data: allMarkets };
    }
  };

  const { title, data } = getMarketData();
  const visibleData = data.slice(0, visibleCount);

  return (
    <section className="market-tabs">
      <div className="tabs-header">
        <button onClick={() => setActiveTab("all")} className={activeTab === "all" ? "active" : ""}>
          All
        </button>
        <button onClick={() => setActiveTab("gainers")} className={activeTab === "gainers" ? "active" : ""}>
          Gainers
        </button>
        <button onClick={() => setActiveTab("losers")} className={activeTab === "losers" ? "active" : ""}>
          Losers
        </button>
        <button
          className="pro"
          onClick={() => {
            window.location.href = "/trade";
          }}
        >
          TRADE PRO 🔒
        </button>
      </div>

      {/* Status Indicators */}
      <div style={{ padding: '0.5rem 1rem' }}>
        {loading && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #f59e0b',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Loading live prices...
          </div>
        )}

        {!loading && isUsingLiveData && lastUpdate && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#10b981',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#10b981',
              display: 'inline-block'
            }}></span>
            Live prices • Updated: {lastUpdate.toLocaleTimeString()}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Manual refresh triggered');
                refetch();
              }}
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {!loading && !isUsingLiveData && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#9ca3af',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#9ca3af',
              display: 'inline-block'
            }}></span>
            Using cached prices
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Retry triggered');
                refetch();
              }}
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#4f46e5'}
              onMouseOut={(e) => e.target.style.background = '#6366f1'}
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            margin: '0.5rem 0',
            background: '#fee2e2', 
            color: '#991b1b',
            borderRadius: '8px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Error retry triggered');
                refetch();
              }}
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              🔄 Retry
            </button>
          </div>
        )}
      </div>

      {/* Market Table */}
      <MarketTable title={title} data={visibleData} />

      {visibleCount < data.length && (
        <div className="load-more">
          <button onClick={() => setVisibleCount((v) => v + 4)}>
            Show more
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}