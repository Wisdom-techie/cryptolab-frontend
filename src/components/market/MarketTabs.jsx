import { useState } from "react";
import MarketTable from "./MarketTable";
import "./MarketTabs.css";
import { formatForMarketTabs } from "../../data/cryptoAssets";

export default function MarketTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  // Get all markets from shared data
  const allMarkets = formatForMarketTabs();

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

      <MarketTable title={title} data={visibleData} />

      {visibleCount < data.length && (
        <div className="load-more">
          <button onClick={() => setVisibleCount((v) => v + 4)}>
            Show more
          </button>
        </div>
      )}
    </section>
  );
}