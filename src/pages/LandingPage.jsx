import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Trade Crypto <br />
            <span className="gradient-text">Without Limits</span>
          </h1>

          <p className="hero-subtitle">
            Cryptolab is a modern crypto brokerage platform that allows you
            to buy, sell, and manage digital assets securely — all in one place.
          </p>

          <div className="hero-buttons">
            <button 
              className="primary-btn"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </button>
            <button 
              className="secondary-btn"
              onClick={() => {
                document.getElementById("markets").scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Markets
            </button>
          </div>
        </div>
      </section>

      {/* PREVIEW MARKETS SECTION */}
      <section className="markets-preview" id="markets">
        <h2>Trending Markets</h2>
        <p className="section-subtitle">
          View real-time prices of popular cryptocurrencies
        </p>

        <div className="market-cards">
          {[
            { name: "Bitcoin", symbol: "BTC", price: "$95,434.95", change: "+0.32%", positive: true },
            { name: "Ethereum", symbol: "ETH", price: "$3,191.26", change: "+0.17%", positive: true },
            { name: "Solana", symbol: "SOL", price: "$134.44", change: "+1.16%", positive: true },
            { name: "Binance Coin", symbol: "BNB", price: "$915.94", change: "+1.01%", positive: true },
            { name: "Dogecoin", symbol: "DOGE", price: "$0.134", change: "+1.04%", positive: true },
            { name: "Cardano", symbol: "ADA", price: "$0.42", change: "-1.88%", positive: false },
          ].map((coin) => (
            <div className="market-card" key={coin.symbol}>
              <div className="coin-header">
                <h3>{coin.symbol}</h3>
                <span className={coin.positive ? "positive" : "negative"}>
                  {coin.change}
                </span>
              </div>
              <p className="coin-name">{coin.name}</p>
              <p className="coin-price">{coin.price}</p>
            </div>
          ))}
        </div>

        <button 
          className="view-all-btn"
          onClick={() => navigate("/auth")}
        >
          Sign Up to View All Markets
        </button>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <h2>Why Choose Cryptolab?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Secure Trading</h3>
            <p>Bank-level security with encrypted data storage and secure authentication</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3>Fast Transactions</h3>
            <p>Buy and sell crypto instantly with real-time market prices</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10"/>
                <line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </svg>
            </div>
            <h3>Portfolio Tracking</h3>
            <p>Monitor your investments with detailed analytics and insights</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3>Low Fees</h3>
            <p>Competitive trading fees to maximize your profits</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2>Ready to Start Trading?</h2>
        <p>Join thousands of users trading crypto on Cryptolab</p>
        <button 
          className="cta-btn"
          onClick={() => navigate("/auth")}
        >
          Create Free Account
        </button>
      </section>
    </div>
  );
}