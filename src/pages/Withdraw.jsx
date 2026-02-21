import "./Withdraw.css";
import { useState, useEffect } from "react";


// Crypto assets with withdrawal info
const cryptoAssets = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    balance: 0.00000000,
    usdValue: 0.00,
    minWithdraw: 0.001,
    fee: 0.0005,
    network: "BTC"
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    balance: 0.00000000,
    usdValue: 0.00,
    minWithdraw: 0.01,
    fee: 0.005,
    network: "ERC20"
  },
  {
    name: "Tether",
    symbol: "USDT",
    logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    balance: 0.00,
    usdValue: 0.00,
    minWithdraw: 10,
    fee: 1,
    network: "TRC20"
  },
  {
    name: "Binance Coin",
    symbol: "BNB",
    logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
    balance: 0.00000000,
    usdValue: 0.00,
    minWithdraw: 0.01,
    fee: 0.0005,
    network: "BEP20"
  },
  {
    name: "Solana",
    symbol: "SOL",
    logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    balance: 0.00000000,
    usdValue: 0.00,
    minWithdraw: 0.1,
    fee: 0.01,
    network: "SOL"
  },
  {
    name: "Cardano",
    symbol: "ADA",
    logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    balance: 0.00000000,
    usdValue: 0.00,
    minWithdraw: 10,
    fee: 1,
    network: "ADA"
  }
];

const MIN_WITHDRAWAL_USD = 500; // Minimum withdrawal in USD

export default function Withdraw() {
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets[0]);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState(selectedAsset.network);
  const [step, setStep] = useState(1); // 1: Form, 2: Confirm, 3: Processing, 4: Success
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Fetch crypto prices on component mount
  useEffect(() => {
    fetchCryptoPrices();
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const response = await cryptoAPI.getLivePrices();
      setCryptoPrices(response.data.prices);
      setLoadingPrices(false);
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      setLoadingPrices(false);
    }
  };

  const getCurrentPrice = (symbol) => {
    return cryptoPrices[symbol]?.price || 0;
  };

  const calculateUsdValue = (assetSymbol, amount) => {
    const price = getCurrentPrice(assetSymbol);
    return price * parseFloat(amount || 0);
  };

  const calculateFee = () => {
    return selectedAsset.fee;
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    return Math.max(0, amountNum - calculateFee());
  };

  const calculateTotalUsdValue = () => {
    const total = calculateTotal();
    return calculateUsdValue(selectedAsset.symbol, total);
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setNetwork(asset.network);
    setAmount("");
  };

  const handleMaxAmount = () => {
    setAmount(selectedAsset.balance.toString());
  };

  const handleContinue = () => {
    if (!walletAddress) {
      alert("Please enter a wallet address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < selectedAsset.minWithdraw) {
      alert(`Minimum withdrawal is ${selectedAsset.minWithdraw} ${selectedAsset.symbol}`);
      return;
    }
    
    // Check USD minimum ($500)
    const usdValue = calculateTotalUsdValue();
    if (usdValue < MIN_WITHDRAWAL_USD) {
      alert(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_USD} USD. Your withdrawal is worth $${usdValue.toFixed(2)} USD.`);
      return;
    }
    
    if (parseFloat(amount) > selectedAsset.balance) {
      alert("Insufficient balance");
      return;
    }
    setStep(2);
  };

  const handleConfirmWithdrawal = () => {
    setStep(3);
    
    // Simulate processing
    setTimeout(() => {
      setStep(4);
    }, 3000);
  };

  const handleNewWithdrawal = () => {
    setStep(1);
    setWalletAddress("");
    setAmount("");
  };

  return (
    <div className="withdraw-page">
      <div className="withdraw-container">
        {/* STEP 1: WITHDRAWAL FORM */}
        {step === 1 && (
          <>
            <div className="withdraw-header">
              <h1>Withdraw Cryptocurrency</h1>
              <p>Transfer your crypto to an external wallet</p>
              <div className="minimum-notice">
                ⚠️ Minimum withdrawal: <strong>${MIN_WITHDRAWAL_USD} USD</strong>
              </div>
            </div>

            <div className="withdraw-grid">
              {/* Asset Selection */}
              <div className="withdraw-section">
                <h2>Select Cryptocurrency</h2>
                <div className="asset-list">
                  {cryptoAssets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className={`asset-item ${selectedAsset.symbol === asset.symbol ? 'active' : ''}`}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <img src={asset.logo} alt={asset.symbol} />
                      <div className="asset-details">
                        <strong>{asset.symbol}</strong>
                        <span className="asset-name">{asset.name}</span>
                      </div>
                      <div className="asset-balance">
                        <span className="balance-amount">{asset.balance}</span>
                        <span className="balance-usd">${asset.usdValue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Withdrawal Form */}
              <div className="withdraw-section">
                <h2>Withdrawal Details</h2>

                <div className="selected-asset-info">
                  <img src={selectedAsset.logo} alt={selectedAsset.symbol} />
                  <div>
                    <h3>{selectedAsset.name}</h3>
                    <p>Available: {selectedAsset.balance} {selectedAsset.symbol}</p>
                    {!loadingPrices && (
                      <p className="current-price">
                        Current Price: ${getCurrentPrice(selectedAsset.symbol).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Network</label>
                  <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                    <option value={selectedAsset.network}>{selectedAsset.network}</option>
                  </select>
                  <p className="field-hint">Choose the correct network to avoid loss of funds</p>
                </div>

                <div className="form-group">
                  <label>Wallet Address</label>
                  <input
                    type="text"
                    placeholder={`Enter ${selectedAsset.symbol} wallet address`}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                  <p className="field-hint">Make sure to double-check the address</p>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <div className="amount-input-group">
                    <input
                      type="text"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setAmount(value);
                        }
                      }}
                    />
                    <button className="max-btn" onClick={handleMaxAmount}>MAX</button>
                  </div>
                  <p className="field-hint">
                    Min: {selectedAsset.minWithdraw} {selectedAsset.symbol} | 
                    Available: {selectedAsset.balance} {selectedAsset.symbol}
                  </p>
                  {amount && !loadingPrices && (
                    <p className={`usd-value ${calculateUsdValue(selectedAsset.symbol, amount) < MIN_WITHDRAWAL_USD ? 'error' : ''}`}>
                      ≈ ${calculateUsdValue(selectedAsset.symbol, amount).toFixed(2)} USD
                      {calculateUsdValue(selectedAsset.symbol, amount) < MIN_WITHDRAWAL_USD && (
                        <span className="min-warning"> (Below ${MIN_WITHDRAWAL_USD} minimum)</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Fee Summary */}
                <div className="fee-summary">
                  <div className="fee-row">
                    <span>Amount</span>
                    <span>{amount || '0.00'} {selectedAsset.symbol}</span>
                  </div>
                  <div className="fee-row">
                    <span>Network Fee</span>
                    <span>{calculateFee()} {selectedAsset.symbol}</span>
                  </div>
                  <div className="fee-row total">
                    <span>You'll Receive</span>
                    <span>{calculateTotal().toFixed(8)} {selectedAsset.symbol}</span>
                  </div>
                  {amount && !loadingPrices && (
                    <div className="fee-row usd-total">
                      <span>USD Value</span>
                      <span className={calculateTotalUsdValue() < MIN_WITHDRAWAL_USD ? 'error' : ''}>
                        ${calculateTotalUsdValue().toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <button className="withdraw-btn" onClick={handleContinue}>
                  Continue to Confirm
                </button>

                <div className="warning-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <strong>Important:</strong> Always verify the wallet address and network before 
                    confirming. Withdrawals cannot be reversed. Minimum withdrawal: ${MIN_WITHDRAWAL_USD} USD.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: CONFIRMATION */}
        {step === 2 && (
          <div className="confirm-screen">
            <h2>Confirm Withdrawal</h2>
            <p>Please review your withdrawal details carefully</p>

            <div className="confirm-card">
              <div className="confirm-row">
                <span className="confirm-label">Cryptocurrency</span>
                <div className="confirm-value">
                  <img src={selectedAsset.logo} alt={selectedAsset.symbol} />
                  <span>{selectedAsset.name} ({selectedAsset.symbol})</span>
                </div>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Network</span>
                <span className="confirm-value">{network}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Wallet Address</span>
                <code className="confirm-address">{walletAddress}</code>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Amount</span>
                <span className="confirm-value">{amount} {selectedAsset.symbol}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Network Fee</span>
                <span className="confirm-value">{calculateFee()} {selectedAsset.symbol}</span>
              </div>

              <div className="confirm-row highlight">
                <span className="confirm-label">You'll Receive</span>
                <span className="confirm-value">{calculateTotal().toFixed(8)} {selectedAsset.symbol}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">USD Value</span>
                <span className="confirm-value">${calculateTotalUsdValue().toFixed(2)}</span>
              </div>
            </div>

            <div className="confirm-actions">
              <button className="back-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="confirm-btn" onClick={handleConfirmWithdrawal}>
                Confirm Withdrawal
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 3 && (
          <div className="processing-screen">
            <div className="loading-spinner">
              <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"/>
              </svg>
            </div>
            <h2>Processing Withdrawal</h2>
            <p>Please wait while we process your transaction...</p>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="success-screen">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2>Withdrawal Submitted!</h2>
            <p>Your withdrawal has been submitted successfully and is being processed.</p>

            <div className="success-details">
              <div className="detail-item">
                <span>Amount</span>
                <strong>{calculateTotal().toFixed(8)} {selectedAsset.symbol}</strong>
              </div>
              <div className="detail-item">
                <span>USD Value</span>
                <strong>${calculateTotalUsdValue().toFixed(2)}</strong>
              </div>
              <div className="detail-item">
                <span>Network</span>
                <strong>{network}</strong>
              </div>
              <div className="detail-item">
                <span>Status</span>
                <strong className="status-pending">Processing</strong>
              </div>
            </div>

            <div className="success-actions">
              <button className="new-withdrawal-btn" onClick={handleNewWithdrawal}>
                New Withdrawal
              </button>
              <button className="view-history-btn">
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}