import "./BuyCrypto.css";
import { useState } from "react";
import BuyModal from "../components/BuyModal";
import { cryptoAssets, formatPrice } from "../data/cryptoAssets";

export default function BuyCrypto() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("marketCap");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Filter and sort assets
  const filteredAssets = cryptoAssets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.price - a.price;
      const marketCapA = parseFloat(a.marketCap.replace(/[$TB]/g, ''));
      const marketCapB = parseFloat(b.marketCap.replace(/[$TB]/g, ''));
      return marketCapB - marketCapA;
    });

  return (
    <div className="buy-crypto">
      <div className="buy-crypto-header">
        <div className="header-content">
          <h1>Buy Cryptocurrency</h1>
          <p>Purchase digital assets securely with multiple payment options</p>
        </div>

        <div className="header-controls">
          {/* Search Bar */}
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="marketCap">Market Cap</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>

          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`asset-${viewMode}`}>
        {filteredAssets.map((asset) => (
          <div className="asset-card" key={asset.symbol}>
            <div className="asset-card-header">
              <img src={asset.logo} alt={asset.name} className="asset-logo" />
              <div className="asset-info">
                <h3>{asset.symbol}</h3>
                <span className="asset-name">{asset.name}</span>
              </div>
            </div>

            <div className="asset-price">
              <span className="price">{formatPrice(asset.price)}</span>
              <span className={`change ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </span>
            </div>

            <div className="asset-stats">
              <div className="stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">{asset.marketCap}</span>
              </div>
            </div>

            <button 
              className="buy-btn"
              onClick={() => setSelectedAsset(asset)}
            >
              Buy {asset.symbol}
            </button>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="no-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No cryptocurrencies found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      )}

      {selectedAsset && (
        <BuyModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}