import "./Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phoneCode: userData.phoneCode || "+1",
    phoneNumber: userData.phoneNumber || "",
    country: userData.country || "",
    currency: userData.currency || "USD"
  });

  const [profileImage, setProfileImage] = useState(null);
  
  // 2FA States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    localStorage.getItem("twoFactorEnabled") === "true"
  );
  const [twoFactorCode, setTwoFactorCode] = useState(
    localStorage.getItem("twoFactorCode") || ""
  );
  const [newTwoFactorCode, setNewTwoFactorCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // ID Verification
  const [idVerified, setIdVerified] = useState(
    localStorage.getItem("idVerified") === "true"
  );

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Activity tracking
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("userActivities");
    return saved ? JSON.parse(saved) : [];
  });

  // Sessions tracking
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("userSessions");
    return saved ? JSON.parse(saved) : [];
  });

  // Get last login time
  const lastLogin = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Track activity function
  const logActivity = (action, details) => {
    const newActivity = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 50);
    setActivities(updatedActivities);
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities));
  };

  // Track page visits
  useEffect(() => {
    if (activeSection !== "profile") {
      logActivity("Page Visit", `Visited ${activeSection} section`);
    }
  }, [activeSection]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        logActivity("Profile Update", "Changed profile picture");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    const updatedData = { ...userData, ...formData };
    localStorage.setItem("userData", JSON.stringify(updatedData));
    logActivity("Profile Update", "Updated personal information");
    alert("Profile updated successfully!");
  };

  const handleDeleteAvatar = () => {
    setProfileImage(null);
    logActivity("Profile Update", "Deleted profile picture");
  };

  // 2FA Handlers
  const handleEnable2FA = () => {
    if (!newTwoFactorCode || newTwoFactorCode.length !== 6) {
      alert("Please enter a 6-digit code");
      return;
    }
    if (!confirmPassword) {
      alert("Please enter your password to confirm");
      return;
    }
    
    localStorage.setItem("twoFactorEnabled", "true");
    localStorage.setItem("twoFactorCode", newTwoFactorCode);
    setTwoFactorEnabled(true);
    setTwoFactorCode(newTwoFactorCode);
    setNewTwoFactorCode("");
    setConfirmPassword("");
    logActivity("Security Update", "Enabled 2FA");
    alert("2FA enabled successfully!");
  };

  const handleDisable2FA = () => {
    if (!confirmPassword) {
      alert("Please enter your password to disable 2FA");
      return;
    }
    
    localStorage.setItem("twoFactorEnabled", "false");
    localStorage.removeItem("twoFactorCode");
    setTwoFactorEnabled(false);
    setTwoFactorCode("");
    setConfirmPassword("");
    logActivity("Security Update", "Disabled 2FA");
    alert("2FA disabled successfully!");
  };

  const handleChange2FA = () => {
    if (!newTwoFactorCode || newTwoFactorCode.length !== 6) {
      alert("Please enter a new 6-digit code");
      return;
    }
    if (!confirmPassword) {
      alert("Please enter your password to confirm");
      return;
    }
    
    localStorage.setItem("twoFactorCode", newTwoFactorCode);
    setTwoFactorCode(newTwoFactorCode);
    setNewTwoFactorCode("");
    setConfirmPassword("");
    logActivity("Security Update", "Changed 2FA code");
    alert("2FA code changed successfully!");
  };

  // Password Handler
  const handleChangePassword = () => {
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    logActivity("Security Update", "Changed password");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    alert("Password changed successfully!");
  };

  // ID Verification
  const handleStartVerification = () => {
    logActivity("Verification", "Started ID verification process");
    alert("Redirecting to ID.me for verification...");
    // In production: window.open("https://www.id.me/", "_blank");
  };

  // Logout
  const handleLogout = () => {
    const currentSession = {
      loginTime: localStorage.getItem("loginTime") || new Date().toISOString(),
      logoutTime: new Date().toISOString(),
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    
    const updatedSessions = [currentSession, ...sessions].slice(0, 20);
    localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
    
    localStorage.removeItem("isAuth");
    localStorage.removeItem("userData");
    localStorage.removeItem("loginTime");
    navigate("/");
  };

  // Menu items
  const menuItems = [
    { 
      id: "profile", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, 
      label: "Profile" 
    },
    { 
      id: "wallet", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, 
      label: "Wallet" 
    },
    { 
      id: "activity", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>, 
      label: "Activity" 
    },
    { 
      id: "2fa", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, 
      label: "2FA Security" 
    },
    { 
      id: "password", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m6-12l-6 6m0 0L6 7m6 6l6 6m-6-6l-6 6"/></svg>, 
      label: "Password" 
    },
    { 
      id: "verification", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, 
      label: "ID Verification" 
    },
    { 
      id: "sessions", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, 
      label: "Sessions History" 
    },
    { 
      id: "referrals", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
      label: "Referrals" 
    },
    { 
      id: "voucher", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, 
      label: "Voucher" 
    },
    { 
      id: "logout", 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>, 
      label: "Log out" 
    }
  ];

  const handleMenuClick = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveSection(id);
    }
  };

  // Group sessions by month
  const sessionsByMonth = {};
  sessions.forEach(session => {
    if (!sessionsByMonth[session.month]) {
      sessionsByMonth[session.month] = [];
    }
    sessionsByMonth[session.month].push(session);
  });

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`menu-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* PROFILE */}
          {activeSection === "profile" && (
            <>
              <div className="content-section">
                <h2>Profile Avatar</h2>
                <div className="avatar-section">
                  <div className="avatar-display">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="avatar-actions">
                    <label className="upload-btn">
                      Upload New
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                    </label>
                    <button className="delete-btn" onClick={handleDeleteAvatar}>
                      Delete avatar
                    </button>
                  </div>
                  <p className="avatar-note">
                    We recommend using a clear photo of yourself for better verification.
                  </p>
                </div>
              </div>

              <div className="content-section">
                <h2>Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g., John" />
                  </div>
                  <div className="form-group">
                    <label>Last name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g., Doe" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <p className="field-note">Email cannot be changed for security reasons. Contact support if needed.</p>
                </div>

                <div className="form-group">
                  <label>Last Login</label>
                  <input type="text" value={lastLogin} disabled />
                </div>

                <button className="update-btn" onClick={handleUpdateProfile}>Update Profile</button>
              </div>

              <div className="content-section">
                <h2>Security Settings</h2>
                
                <div className="security-item">
                  <div className="security-header">
                    <h3>Two-Factor Authentication (2FA)</h3>
                    {twoFactorEnabled ? (
                      <span className="verified-badge">✓ Enabled</span>
                    ) : (
                      <span className="unverified-badge">Disabled</span>
                    )}
                  </div>
                  <p>Enable 2FA to add an extra layer of security to your account.</p>
                </div>

                <div className="security-item">
                  <div className="security-header">
                    <h3>ID verification</h3>
                    {idVerified ? (
                      <span className="verified-badge">✓ Verified</span>
                    ) : (
                      <span className="unverified-badge">✗ Not activated</span>
                    )}
                  </div>
                  <p>To access full trading features and higher withdrawal limits, please verify your identity.</p>
                </div>
              </div>
            </>
          )}

          {/* WALLET */}
          {activeSection === "wallet" && (
            <div className="content-section">
              <h2>Wallet</h2>
              <div className="wallet-overview">
                <div className="wallet-card">
                  <h3>Total Balance</h3>
                  <p className="wallet-amount">$0.00</p>
                  <span className="wallet-crypto">0.00000000 BTC</span>
                </div>
                <div className="wallet-card">
                  <h3>Available Balance</h3>
                  <p className="wallet-amount">$0.00</p>
                  <span className="wallet-crypto">0.00000000 BTC</span>
                </div>
              </div>
              <div className="wallet-actions">
                <button className="action-button primary" onClick={() => navigate("/buy-crypto")}>Deposit</button>
                <button className="action-button secondary" onClick={() => navigate("/withdraw")}>Withdraw</button>
              </div>
            </div>
          )}

          {/* ACTIVITY */}
          {activeSection === "activity" && (
            <div className="content-section">
              <h2>Activity History</h2>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <p className="empty-state">No recent activity</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                      </div>
                      <div className="activity-details">
                        <h4>{activity.action}</h4>
                        <p>{activity.details}</p>
                        <span className="activity-time">{activity.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2FA */}
          {activeSection === "2fa" && (
            <div className="content-section">
              <h2>Two-Factor Authentication</h2>
              <div className="twofa-content">
                <div className="info-box">
                  <h3>Enhance Your Security</h3>
                  <p>Two-factor authentication adds an extra layer of security to your account. You'll need to provide a 6-digit code along with your password when logging in.</p>
                  {twoFactorEnabled && (
                    <p style={{ marginTop: '1rem', color: '#10b981' }}>✓ Current Code: {twoFactorCode ? '••••••' : 'Not set'}</p>
                  )}
                </div>

                {!twoFactorEnabled ? (
                  <>
                    <div className="form-group">
                      <label>Create 6-Digit Code</label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6 digits"
                        value={newTwoFactorCode}
                        onChange={(e) => setNewTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input type="password" placeholder="Enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button className="action-button primary" onClick={handleEnable2FA}>Enable 2FA</button>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>New 6-Digit Code (to change)</label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter new 6 digits"
                        value={newTwoFactorCode}
                        onChange={(e) => setNewTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input type="password" placeholder="Enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="twofa-button-group">
                      <button className="action-button primary" onClick={handleChange2FA}>Change Code</button>
                      <button className="action-button secondary" onClick={handleDisable2FA}>Disable 2FA</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* PASSWORD */}
          {activeSection === "password" && (
            <div className="content-section">
              <h2>Change Password</h2>
              {passwordError && <div className="error-message">{passwordError}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="field-note" style={{ color: '#ef4444' }}>Passwords do not match</p>
                )}
                {newPassword && confirmNewPassword && newPassword === confirmNewPassword && (
                  <p className="field-note" style={{ color: '#10b981' }}>✓ Passwords match</p>
                )}
              </div>
              <button className="update-btn" onClick={handleChangePassword}>Update Password</button>
            </div>
          )}

          {/* VERIFICATION */}
          {activeSection === "verification" && (
            <div className="content-section">
              <h2>ID Verification</h2>
              <div className="verification-content">
                <div className="verification-status">
                  {idVerified ? (
                    <div className="status-verified">
                      <span className="status-icon">✓</span>
                      <h3>Your identity is verified</h3>
                      <p>You have full access to all platform features.</p>
                    </div>
                  ) : (
                    <div className="status-unverified">
                      <span className="status-icon">✗</span>
                      <h3>Identity verification required</h3>
                      <p>Complete identity verification through ID.me to access advanced features and increase your withdrawal limits.</p>
                      <div className="verification-provider">
                        <img src="https://developers.id.me/assets/images/logo.svg" alt="ID.me" style={{ width: '120px', margin: '1.5rem 0' }} />
                        <p style={{ fontSize: '0.9rem', color: '#888' }}>Powered by ID.me - Trusted identity verification</p>
                      </div>
                      <button className="action-button primary" onClick={handleStartVerification}>Verify with ID.me</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS */}
          {activeSection === "sessions" && (
            <div className="content-section">
              <h2>Sessions History</h2>
              <p className="section-subtitle">View your login and logout history organized by month</p>
              
              {Object.keys(sessionsByMonth).length === 0 ? (
                <div className="sessions-list">
                  <div className="session-item">
                    <div className="session-info">
                      <h4>Current Session</h4>
                      <div className="session-times">
                        <p><strong>Login:</strong> {lastLogin}</p>
                        <p><strong>Status:</strong> <span className="session-active">Active</span></p>
                      </div>
                      <span className="session-device">Web Browser</span>
                    </div>
                  </div>
                </div>
              ) : (
                Object.keys(sessionsByMonth).map(month => (
                  <div key={month} className="session-month-group">
                    <h3 className="month-header">{month}</h3>
                    <div className="sessions-list">
                      {sessionsByMonth[month].map((session, index) => (
                        <div key={index} className="session-item">
                          <div className="session-info">
                            <h4>Session {index + 1}</h4>
                            <div className="session-times">
                              <p><strong>Login:</strong> {new Date(session.loginTime).toLocaleString()}</p>
                              <p><strong>Logout:</strong> {new Date(session.logoutTime).toLocaleString()}</p>
                            </div>
                            <span className="session-device">Web Browser</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* REFERRALS */}
          {activeSection === "referrals" && (
            <div className="content-section">
              <h2>Referral Program</h2>
              <div className="referral-content">
                <div className="referral-card">
                  <h3>Your Referral Code</h3>
                  <div className="referral-code">
                    <code>CRYPTO{Math.random().toString(36).substr(2, 6).toUpperCase()}</code>
                    <button className="copy-btn" onClick={() => alert("Referral code copied!")}>Copy</button>
                  </div>
                  <p>Share your code and earn rewards when friends sign up!</p>
                </div>
                <div className="referral-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Referrals</span>
                    <span className="stat-value">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Earnings</span>
                    <span className="stat-value">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VOUCHER */}
          {activeSection === "voucher" && (
            <div className="content-section">
              <h2>Voucher</h2>
              <div className="voucher-content">
                <div className="form-group">
                  <label>Enter Voucher Code</label>
                  <div className="voucher-input">
                    <input type="text" placeholder="Enter your voucher code" />
                    <button className="action-button primary">Redeem</button>
                  </div>
                </div>
                <p className="voucher-note">Have a voucher code? Enter it above to claim your reward.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}