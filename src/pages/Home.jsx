import "./Home.css";
import MarketTabs from "../components/market/MarketTabs";
import InfoCards from "../components/info/InfoCards";
import FAQ from "../components/faq/FAQ";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="home">
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
      </div>

      {/* MARKET TABS */}
      <MarketTabs />

      <InfoCards />
      <FAQ />
    </>
  );
}
