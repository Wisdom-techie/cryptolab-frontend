import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./navbar.css";

export default function Navbar({ isPublic = false }) {
  const [theme, setTheme] = useState("dark");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuth") === "true";

  // Get user data
  const userData = isAuthenticated 
    ? JSON.parse(localStorage.getItem("userData") || '{}')
    : null;

  const userInitials = userData?.firstName && userData?.lastName
    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    : "U";

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-dropdown-container')) {
        setShowProfileMenu(false);
      }
      if (showMobileMenu && !e.target.closest('.mobile-menu') && !e.target.closest('.hamburger-btn')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu, showMobileMenu]);

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("userData");
    setShowProfileMenu(false);
    navigate("/");
  };

  const handleMobileNavClick = (path) => {
    setShowMobileMenu(false);
    if (path.startsWith('#')) {
      if (window.location.pathname === "/") {
        document.getElementById(path.slice(1))?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
      }
    } else {
      navigate(path);
    }
  };

  return (
    <header className="navbar">
      {/* Left */}
      <div className="nav-left">
        <Link to={isPublic ? "/" : "/home"} className="logo">
          Cryptolab
        </Link>
      </div>

      {/* Center - Desktop Only */}
      <nav className="nav-center">
        {isPublic ? (
          // PUBLIC NAVBAR
          <>
            <a href="#markets" onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname === "/") {
                document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
              }
            }}>Markets</a>
            <Link to="/auth">Trade</Link>
            <Link to="#">Learn</Link>
          </>
        ) : (
          // AUTHENTICATED NAVBAR
          <>
            <Link to="/home">Markets</Link>
            <Link to="/buy-crypto">Buy Crypto</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/trade" className="pro-link">Trade PRO 🔒</Link>
          </>
        )}
      </nav>

      {/* Right */}
      <div className="nav-right">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {/* Hamburger Menu Button - Mobile Only */}
        <button 
          className="hamburger-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className={showMobileMenu ? 'active' : ''}></span>
          <span className={showMobileMenu ? 'active' : ''}></span>
          <span className={showMobileMenu ? 'active' : ''}></span>
        </button>

        {isPublic ? (
          // PUBLIC: Show Sign up / Sign in
          <button className="auth-btn" onClick={() => navigate("/auth")}>
            Sign up / Sign in
          </button>
        ) : (
          // AUTHENTICATED: Show Profile Dropdown
          <div className="profile-dropdown-container">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {userInitials}
              </div>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="currentColor"
                className={`dropdown-arrow ${showProfileMenu ? 'open' : ''}`}
              >
                <path d="M6 9L1 4h10z"/>
              </svg>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {userInitials}
                  </div>
                  <div className="profile-info">
                    <p className="profile-name">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="profile-email">{userData?.email}</p>
                  </div>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-menu">
                  <button onClick={() => {
                    navigate("/dashboard");
                    setShowProfileMenu(false);
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </button>

                  <button onClick={() => {
                    navigate("/dashboard");
                    setShowProfileMenu(false);
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    Portfolio
                  </button>

                  <button onClick={() => {
                    setShowProfileMenu(false);
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m6-12l-6 6m0 0L6 7m6 6l6 6m-6-6l-6 6"/>
                    </svg>
                    Settings
                  </button>

                  <button onClick={() => {
                    setShowProfileMenu(false);
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4m0-4h.01"/>
                    </svg>
                    Help & Support
                  </button>
                </div>

                <div className="profile-divider"></div>

                <button className="logout-btn" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          {isPublic ? (
            <>
              <a onClick={() => handleMobileNavClick('#markets')}>Markets</a>
              <a onClick={() => handleMobileNavClick('/auth')}>Trade</a>
              <a onClick={() => handleMobileNavClick('#')}>Learn</a>
            </>
          ) : (
            <>
              <a onClick={() => handleMobileNavClick('/home')}>Markets</a>
              <a onClick={() => handleMobileNavClick('/buy-crypto')}>Buy Crypto</a>
              <a onClick={() => handleMobileNavClick('/dashboard')}>Dashboard</a>
              <a onClick={() => handleMobileNavClick('/trade')} className="pro-link">Trade PRO 🔒</a>
            </>
          )}
        </div>
      )}
    </header>
  );
}