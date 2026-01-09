import { useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-brand">
          <h3>Cryptolab</h3>
          <p>
            A modern crypto brokerage platform for buying, managing, and
            tracking digital assets securely.
          </p>
        </div>

        {/* PLATFORM */}
        <div className="footer-links">
          <h4>Platform</h4>
          <Link to="/home">Home</Link>
          <Link to="/buy-crypto">Buy Crypto</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        {/* RESOURCES */}
        <div className="footer-links">
          <h4 onClick={() => toggleSection("resources")} className="toggle-title">
            Resources <span>{openSection === "resources" ? "−" : "+"}</span>
          </h4>

          {openSection === "resources" && (
            <div className="toggle-content">
              <p>
                <strong>FAQ</strong><br />
                Answers to common questions about accounts, security, and
                transactions.
              </p>

              <p>
                <strong>Support</strong><br />
                Get help with technical issues, payments, or account access.
              </p>

              <p>
                <strong>Documentation</strong><br />
                Learn how Cryptolab works and explore platform features.
              </p>
            </div>
          )}
        </div>

        {/* LEGAL */}
        <div className="footer-links">
          <h4 onClick={() => toggleSection("legal")} className="toggle-title">
            Legal <span>{openSection === "legal" ? "−" : "+"}</span>
          </h4>

          {openSection === "legal" && (
            <div className="toggle-content">
              <p>
                <strong>Terms of Service</strong><br />
                Rules and conditions for using the Cryptolab platform.
              </p>

              <p>
                <strong>Privacy Policy</strong><br />
                How we collect, use, and protect user information.
              </p>

              <p>
                <strong>Disclaimer</strong><br />
                Crypto trading involves risk. Prices may fluctuate.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Cryptolab. All rights reserved.</p>
      </div>
    </footer>
  );
}
