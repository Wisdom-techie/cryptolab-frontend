import { useState } from 'react';
import './CustomerSupport.css';

// FAQ Database
const FAQ_RESPONSES = {
  greeting: [
    "hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"
  ],
  deposit: [
    "deposit", "add funds", "fund account", "how to deposit", "add money", "top up"
  ],
  withdrawal: [
    "withdraw", "withdrawal", "cash out", "take out money", "how to withdraw"
  ],
  fees: [
    "fee", "fees", "charge", "charges", "cost", "commission"
  ],
  time: [
    "how long", "time", "duration", "when", "speed", "fast"
  ],
  security: [
    "safe", "secure", "security", "trust", "protected", "scam"
  ],
  verification: [
    "verify", "verification", "kyc", "identity", "id"
  ],
  support: [
    "help", "support", "contact", "talk", "speak", "human"
  ]
};

const RESPONSES = {
  greeting: "👋 Hello! I'm here to help. You can ask me about deposits, withdrawals, fees, security, or anything else!",
  deposit: "💰 To deposit cryptocurrency:\n\n1. Go to 'Buy Crypto' or 'Dashboard'\n2. Select your cryptocurrency\n3. Choose payment method\n4. Follow the instructions\n5. Your deposit will be credited after admin approval\n\nNeed more help? Contact our Telegram support!",
  withdrawal: "💸 To withdraw cryptocurrency:\n\n1. Go to 'Withdraw' page\n2. Select cryptocurrency\n3. Enter wallet address (double-check!)\n4. Enter amount (minimum $500 USD)\n5. Confirm withdrawal\n\nProcessing usually takes 24-48 hours. Need help? Contact us on Telegram!",
  fees: "💵 Our fees:\n\n• Deposit: FREE (admin confirmed)\n• Withdrawal: Network fees apply (varies by crypto)\n• Trading: Competitive rates\n• Minimum withdrawal: $500 USD\n\nHave questions? Reach out on Telegram!",
  time: "⏱️ Processing times:\n\n• Deposits: 1-24 hours (after admin approval)\n• Withdrawals: 24-48 hours\n• Verification: 1-3 business days\n\nNeed faster support? Contact us on Telegram!",
  security: "🔒 Your security is our priority:\n\n• SSL encryption\n• Secure wallet storage\n• 2FA authentication available\n• Regular security audits\n• Your funds are protected\n\nWe're legitimate and trustworthy. Questions? Message us on Telegram!",
  verification: "✅ Verification (KYC):\n\nCurrently, basic trading doesn't require KYC. For higher limits, you may need to verify your identity.\n\nContact us on Telegram for more details!",
  support: "👨‍💼 Need human support?\n\nOur team is ready to help you on Telegram! Click the 'Chat on Telegram' button below for instant assistance.\n\nWe're here 24/7!",
  default: "🤔 I'm not sure about that. Here are some things I can help with:\n\n• Deposits & Withdrawals\n• Fees & Charges\n• Security & Safety\n• Processing Times\n• Account Verification\n\nOr contact our team on Telegram for personalized help!"
};

export default function CustomerSupport() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your Cryptolab assistant. Ask me anything about deposits, withdrawals, fees, or security!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  
  const TELEGRAM_LINK = 'https://t.me/crylab_1'; // Change this!
  
  const handleTelegramClick = () => {
    window.open(TELEGRAM_LINK, '_blank');
  };

  const findResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check each category
    for (const [category, keywords] of Object.entries(FAQ_RESPONSES)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return RESPONSES[category];
      }
    }
    
    return RESPONSES.default;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: findResponse(inputText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      <div 
        className={`support-widget ${isExpanded ? 'expanded' : ''}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {!isExpanded ? (
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
          <div className="support-card">
            <div className="support-header">
              <div className="support-avatar">
                {showChat ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="support-info">
                <h4>{showChat ? 'Chat Assistant' : 'Customer Support'}</h4>
                <div className="support-status">
                  <span className="status-dot"></span>
                  {showChat ? 'Bot Active' : 'Online Now'}
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  setShowChat(false);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {!showChat ? (
              <div className="support-body">
                <p className="support-greeting">
                  👋 Hi there! Need help?
                </p>
                <p className="support-message">
                  Choose how you'd like to get support:
                </p>

                <div className="support-options">
                  <button 
                    className="option-btn chat-btn"
                    onClick={() => setShowChat(true)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Chat with Bot
                    <span className="option-badge">Instant</span>
                  </button>

                  <button 
                    className="option-btn telegram-btn-alt"
                    onClick={handleTelegramClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z"/>
                    </svg>
                    Contact Human Support
                    <span className="option-badge">24/7</span>
                  </button>
                </div>

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
                    <span>Expert Assistance</span>
                  </div>
                  <div className="feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Secure & Private</span>
                  </div>
                </div>

                <div className="support-alt">
                  <p>Or email us at</p>
                  <a href="mailto:support@cryptolab.trade">support@cryptolab.trade</a>
                </div>
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                      <div className="message-content">
                        {msg.text}
                      </div>
                      <div className="message-time">{msg.time}</div>
                    </div>
                  ))}
                </div>

                <div className="quick-questions">
                  <button onClick={() => handleQuickQuestion('How do I deposit?')}>
                    💰 Deposits
                  </button>
                  <button onClick={() => handleQuickQuestion('How do I withdraw?')}>
                    💸 Withdrawals
                  </button>
                  <button onClick={() => handleQuickQuestion('What are the fees?')}>
                    💵 Fees
                  </button>
                  <button onClick={() => handleQuickQuestion('Is it safe?')}>
                    🔒 Security
                  </button>
                </div>

                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your question..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>

                <button className="human-support-link" onClick={handleTelegramClick}>
                  Need human help? Chat on Telegram →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}