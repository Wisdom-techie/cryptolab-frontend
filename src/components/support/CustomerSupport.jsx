import { useState } from 'react';
import './CustomerSupport.css';

export default function CustomerSupport() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Replace with your actual Telegram link
  const TELEGRAM_LINK = 'https://t.me/yourusername'; // Change this!
  
  const handleTelegramClick = () => {
    window.open(TELEGRAM_LINK, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        className={`support-widget ${isExpanded ? 'expanded' : ''}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {!isExpanded ? (
          // Collapsed State - Just the Button
          <div className="support-button">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="support-pulse"></span>
          </div>
        ) : (
          // Expanded State - Support Card
          <div className="support-card">
            <div className="support-header">
              <div className="support-avatar">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="support-info">
                <h4>Customer Support</h4>
                <div className="support-status">
                  <span className="status-dot"></span>
                  Online Now
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="support-body">
              <p className="support-greeting">
                👋 Hi there! Need help?
              </p>
              <p className="support-message">
                Chat with us on Telegram for instant support. Our team is ready to assist you!
              </p>

              <div className="support-features">
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Fast Response Time</span>
                </div>
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>24/7 Support Available</span>
                </div>
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Expert Assistance</span>
                </div>
              </div>

              <button 
                className="telegram-btn"
                onClick={handleTelegramClick}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z"/>
                </svg>
                Chat on Telegram
              </button>

              <div className="support-alt">
                <p>Or email us at</p>
                <a href="mailto:support@cryptolab.trade">support@cryptolab.trade</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}