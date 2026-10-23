
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";
import MarketTabs from "../components/market/MarketTabs";
import InfoCards from "../components/Info/InfoCards";
import FAQ from "../components/faq/FAQ";

export default function Home() {
  const navigate = useNavigate();

  // Hide the balance by default for privacy.
  const [showBalance, setShowBalance] = useState(false);

  // Placeholder only. Connect this to authenticated portfolio data later.
  const totalBalance = 0;

  const formattedBalance = showBalance
    ? `$${totalBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "••••••";

  const toggleBalance = () => {
    setShowBalance((previous) => !previous);
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="home">
        <div className="hero">
          <h1>
            Trade Crypto <br />
            <span>Without Limits</span>
          </h1>

          <p>
            Cryptolab is a modern crypto brokerage platform that allows you
            to buy, sell, and manage digital assets securely — all in one place.
          </p>

          <button onClick={() => navigate("/buy-crypto")}>
            Buy Crypto
          </button>
        </div>
      </section>

      {/* PORTFOLIO BALANCE */}
      <section className="home-balance-section">
        <div className="home-balance-card">
          <div className="home-balance-top">
            <div className="home-balance-heading">
              <span className="home-balance-label">
                Total Portfolio Balance
              </span>

              <h2 className="home-balance-amount">
                {formattedBalance}
              </h2>

              <span className="home-balance-note">
                Balance preview
              </span>
            </div>

            <button
              type="button"
              className="balance-visibility-btn"
              onClick={toggleBalance}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              aria-pressed={showBalance}
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? (
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 3 18 18" />
                  <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16.5 16.5 0 0 1-4 4.7" />
                  <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              )}
            </button>
          </div>

          <div className="home-balance-divider" />

          <div className="home-balance-bottom">
            <div>
              <span className="home-balance-label">
                Available Balance
              </span>

              <strong className="home-available-amount">
                {formattedBalance}
              </strong>
            </div>

            <button
              type="button"
              className="home-balance-action"
              onClick={() => navigate("/buy-crypto")}
            >
              <span aria-hidden="true">+</span> Buy Crypto
            </button>
          </div>
        </div>
      </section>

      {/* MARKET SECTION */}
      <MarketTabs />

      {/* INFORMATION AND FAQ */}
      <InfoCards />
      <FAQ />
    </>
  );
}
