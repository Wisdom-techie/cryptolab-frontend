import "./BuyModal.css";
import { useState, useEffect } from "react";

// Third-party payment gateways (like Wexnozy)
const thirdPartyGateways = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal balance or linked cards",
    logo: "https://www.paypalobjects.com/webstatic/icon/pp258.png",
    countries: "200+ countries"
  },
  {
    id: "paybis",
    name: "Paybis",
    description: "Credit & debit cards, bank transfers, Skrill, Neteller",
    logo: "https://cdn.paybis.com/favicon/favicon-96x96.png",
    countries: "Global"
  },
  {
    id: "bitpay",
    name: "Bitpay",
    description: "Credit & debit cards, Apple Pay, bank transfers",
    logo: "https://bitpay.com/img/wallet-logos/bitpay-wallet.svg",
    countries: "Multiple countries"
  },
  {
    id: "changelly",
    name: "Changelly",
    description: "Bank cards, Apple Pay, Google Pay, local methods",
    logo: "https://changelly.com/favicon.svg",
    countries: "170+ countries"
  },
  {
    id: "simplex",
    name: "Simplex",
    description: "Visa, Mastercard, Apple Pay, bank transfers",
    logo: "https://www.simplex.com/favicon.ico",
    countries: "Worldwide"
  },
  {
    id: "ramp",
    name: "Ramp",
    description: "Bank transfers, cards, Apple Pay, local payments",
    logo: "https://ramp.network/favicon.ico",
    countries: "150+ countries"
  },
  {
    id: "banxa",
    name: "Banxa",
    description: "Bank transfers, cards, regional payment options",
    logo: "https://banxa.com/favicon.ico",
    countries: "Multiple jurisdictions"
  }
];

export default function BuyModal({ asset, onClose }) {
  const [step, setStep] = useState(1); // 1: Amount, 2: Payment Method, 3: Wallet/Gateway, 4: Confirming, 5: Success
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState(""); // 'wallet' or 'gateway'
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [hasDeposited, setHasDeposited] = useState(false);
  const [confirmingDeposit, setConfirmingDeposit] = useState(false);
  const [confirmationTime, setConfirmationTime] = useState(0);

  // Wallet address (you'll provide this)
  const walletAddresses = {
  BTC: "1CBMgBohgqG7tY2rTQ11wsucDprLm1Gp91",
  ETH: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  USDT: "TLpzvToontHSkSrzpHVeSc6cTzsNH16WbN", // TRC20
  BNB: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  SOL: "DBCGZ1UX2GuegrmW6oGhTYX8rfLfJpLabVXfHWvohMTe",
  DOGE: "DRbXCrwvAMRjzzsi2AeGK1UfmnWY1uEJKi",
  MATIC: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  ADA: "addr1q840x792swcsp7eajjmvzx5ks7kjwuvagl9239a594ff33dpk92pmdyujegr5w7v4hksy9895m52dk4324d674xt9dcs2n5ty0",
  XRP: "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv",
  LTC: "MFLMvHdEfQgNzFbJ3wLByVXH8VVMrDJDEY",
  AVAX: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  DASH: "XjBtK2fEkAyHZvmqPZfX18DvQ7VZDbMSeR",
  USDC: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  SHIB: "0xdfa9d45ce1e58f9ee6eb79cbd8e96f22bf603373",
  LINK: "0x2eb5529b22c6905fca919065232c7c1424284e13",
  TON: "UQDxqSrLVLrkQrxSWqP9NHSzVKhuhK23pALB_-okR1JIi1cB",
  TRX: "TLpzvToontHSkSrzpHVeSc6cTzsNH16WbN",
  UNI: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  ATOM: "cosmos123gy7ge4tyast0cqvhde67m2asmhny4gfjakva",
  APT: "0x3a92d5dff963850f3b89998ea495459a63eb9a837fefc26f6a27bb8736735e1b0xxy2kgdygjrsqtzq2n0yrf2493p83k...",
  OP: "0x2eb5529b22c6905fca919065232c7c1424284e13"
};
 // Replace with your actual address
 const walletAddress = walletAddresses[asset.symbol] || "Address not configured";

  const userData = JSON.parse(localStorage.getItem("userData") || '{}');
  const preferredCurrency = userData.currency || "USD";

  // Calculate crypto amount
  const amountNum = parseFloat(amount) || 0;
  const cryptoQty = amountNum / asset.price;

  // Confirmation timer
  useEffect(() => {
    let interval;
    if (confirmingDeposit) {
      interval = setInterval(() => {
        setConfirmationTime(prev => {
          if (prev >= 60) {
            // Simulate admin confirmation after 30-60 seconds
            clearInterval(interval);
            setConfirmingDeposit(false);
            setStep(5); // Success
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [confirmingDeposit]);

  const formatPrice = (price) => {
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleContinueToPayment = () => {
    if (!amount || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setStep(2);
  };

  const handlePaymentTypeSelect = (type) => {
    setPaymentType(type);
    setStep(3);
  };

  const handleGatewaySelect = (gateway) => {
    setSelectedGateway(gateway);
    // In production, this would redirect to the gateway
    alert(`Redirecting to ${gateway.name}...`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  const handleConfirmDeposit = () => {
    if (!hasDeposited) {
      alert("Please confirm you have made the deposit");
      return;
    }
    setConfirmingDeposit(true);
    setStep(4);
  };

  const handleCloseFinal = () => {
    // Reset all states
    setStep(1);
    setAmount("");
    setPaymentType("");
    setSelectedGateway(null);
    setHasDeposited(false);
    setConfirmingDeposit(false);
    setConfirmationTime(0);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* STEP 1: ENTER AMOUNT */}
        {step === 1 && (
          <>
            <div className="modal-header">
              <img src={asset.logo} alt={asset.name} className="modal-asset-logo" />
              <div>
                <h3>Buy {asset.name}</h3>
                <p className="modal-subtitle">{asset.symbol} · ${formatPrice(asset.price)}</p>
              </div>
            </div>

            <div className="modal-section">
              <label className="modal-label">Amount to Spend ({preferredCurrency})</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="text"
                  className="amount-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>

              <div className="quick-amounts">
                {[50, 100, 500, 1000].map((value) => (
                  <button
                    key={value}
                    className="quick-amount-btn"
                    onClick={() => handleQuickAmount(value)}
                  >
                    ${value}
                  </button>
                ))}
              </div>

              {amount && amountNum > 0 && (
                <div className="crypto-estimate">
                  <span>You'll receive approximately</span>
                  <strong>{formatPrice(cryptoQty)} {asset.symbol}</strong>
                </div>
              )}
            </div>

            <button className="modal-btn primary" onClick={handleContinueToPayment}>
              Continue
            </button>
          </>
        )}

        {/* STEP 2: SELECT PAYMENT METHOD */}
        {step === 2 && (
          <>
            <div className="modal-header">
              <h3>Select Payment Method</h3>
              <p className="modal-subtitle">Choose how you want to pay for {asset.symbol}</p>
            </div>

            <div className="payment-type-cards">
              <div 
                className="payment-type-card"
                onClick={() => handlePaymentTypeSelect('wallet')}
              >
                <div className="payment-type-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <h4>Direct Wallet Deposit</h4>
                <p>Send crypto directly to our wallet address</p>
                <div className="badge recommended">Recommended</div>
              </div>

              <div 
                className="payment-type-card"
                onClick={() => handlePaymentTypeSelect('gateway')}
              >
                <div className="payment-type-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v12M6 12h12"/>
                  </svg>
                </div>
                <h4>Third-Party Gateways</h4>
                <p>Use credit cards, bank transfers, and more</p>
                <div className="badge">Multiple Options</div>
              </div>
            </div>

            <button className="modal-btn secondary" onClick={() => setStep(1)}>
              Back
            </button>
          </>
        )}

        {/* STEP 3A: WALLET DEPOSIT */}
        {step === 3 && paymentType === 'wallet' && (
          <>
            <div className="modal-header">
              <h3>Wallet Deposit</h3>
              <p className="modal-subtitle">Send {asset.symbol} to complete your purchase</p>
            </div>

            <div className="wallet-info-card">
              <div className="wallet-amount">
                <span className="label">Amount to send</span>
                <span className="value">{formatPrice(cryptoQty)} {asset.symbol}</span>
                <span className="usd-value">≈ ${amountNum.toFixed(2)}</span>
              </div>

              <div className="wallet-address-section">
                <label>Wallet Address</label>
                <div className="wallet-address-display">
                  <code>{walletAddress}</code>
                  <button onClick={() => copyToClipboard(walletAddress)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                  </button>
                </div>
              </div>

              <div className="wallet-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Copy the wallet address above</li>
                  <li>Open your crypto wallet</li>
                  <li>Send exactly <strong>{formatPrice(cryptoQty)} {asset.symbol}</strong></li>
                  <li>Check the box below after sending</li>
                </ol>
              </div>

              <div className="confirmation-checkbox">
                <input 
                  type="checkbox" 
                  id="deposit-confirm"
                  checked={hasDeposited}
                  onChange={(e) => setHasDeposited(e.target.checked)}
                />
                <label htmlFor="deposit-confirm">
                  I have sent the crypto to the wallet address
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button 
                className="modal-btn primary" 
                onClick={handleConfirmDeposit}
                disabled={!hasDeposited}
              >
                Confirm Deposit
              </button>
            </div>
          </>
        )}

        {/* STEP 3B: THIRD-PARTY GATEWAYS */}
        {step === 3 && paymentType === 'gateway' && (
          <>
            <div className="modal-header">
              <h3>Choose Payment Gateway</h3>
              <p className="modal-subtitle">Select a payment provider to complete your purchase</p>
            </div>

            <div className="gateway-list">
              {thirdPartyGateways.map((gateway) => (
                <div 
                  key={gateway.id}
                  className="gateway-card"
                  onClick={() => handleGatewaySelect(gateway)}
                >
                  <div className="gateway-logo">
                    <img src={gateway.logo} alt={gateway.name} />
                  </div>
                  <div className="gateway-info">
                    <h4>{gateway.name}</h4>
                    <p>{gateway.description}</p>
                    <span className="gateway-countries">{gateway.countries}</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
            </div>

            <button className="modal-btn secondary" onClick={() => setStep(2)}>
              Back
            </button>
          </>
        )}

        {/* STEP 4: CONFIRMING DEPOSIT */}
        {step === 4 && (
          <div className="confirming-screen">
            <div className="loading-spinner">
              <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"/>
              </svg>
            </div>
            <h3>Confirming Transaction</h3>
            <p>Please wait while we verify your deposit...</p>
            <p className="timer">Time elapsed: {confirmationTime}s</p>
            <div className="confirming-details">
              <div className="detail-row">
                <span>Amount</span>
                <span>{formatPrice(cryptoQty)} {asset.symbol}</span>
              </div>
              <div className="detail-row">
                <span>Value</span>
                <span>${amountNum.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <div className="success-screen">
            <div className="success-icon-large">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>Purchase Successful!</h3>
            <p>Your {asset.name} has been credited to your wallet.</p>
            
            <div className="success-details">
              <div className="success-row">
                <span>Amount</span>
                <strong>{formatPrice(cryptoQty)} {asset.symbol}</strong>
              </div>
              <div className="success-row">
                <span>Total Paid</span>
                <strong>${amountNum.toFixed(2)}</strong>
              </div>
            </div>

            <button className="modal-btn primary" onClick={handleCloseFinal}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}