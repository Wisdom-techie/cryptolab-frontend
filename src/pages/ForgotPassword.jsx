import "./Auth.css"; // Reuse Auth.css styles
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Simulate sending verification code
  const handleSendCode = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    // In production, this would call your API
    console.log("Sending verification code to:", email);
    
    // Move to step 2
    setStep(2);
  };

  // Simulate verifying code
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    // In production, verify code with backend
    console.log("Verifying code:", verificationCode);
    
    // Move to step 3
    setStep(3);
  };

  // Reset password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // In production, update password in backend
    console.log("Password reset successful");
    
    // Show success message
    setSuccess(true);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate("/auth");
    }, 2000);
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-overlay">
          <h1>Cryptolab</h1>
          <p>Secure your account with a strong password.</p>
          
          {/* Progress Indicator */}
          <div className="auth-steps" style={{ marginTop: "3rem" }}>
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              <span>1</span> Email
            </div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              <span>2</span> Verify
            </div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>
              <span>3</span> Reset
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Back button */}
          <button 
            className="back-link"
            onClick={() => navigate("/auth")}
          >
            ← Back to Sign In
          </button>

          <h2>Reset Password</h2>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <>
              <p className="auth-subtitle">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <button onClick={handleSendCode}>
                Send Verification Code
              </button>
            </>
          )}

          {/* STEP 2: Enter Verification Code */}
          {step === 2 && (
            <>
              <p className="auth-subtitle">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>

              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                style={{ 
                  textAlign: "center", 
                  fontSize: "1.5rem", 
                  letterSpacing: "0.5rem",
                  fontWeight: "600"
                }}
              />

              {error && <p className="auth-error">{error}</p>}

              <div className="auth-buttons">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="back-btn"
                >
                  Back
                </button>
                <button onClick={handleVerifyCode}>
                  Verify Code
                </button>
              </div>

              <div className="resend-code">
                Didn't receive the code?{" "}
                <span onClick={handleSendCode}>Resend</span>
              </div>
            </>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && !success && (
            <>
              <p className="auth-subtitle">
                Create a new password for your account
              </p>

              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <div className="auth-buttons">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="back-btn"
                >
                  Back
                </button>
                <button onClick={handleResetPassword}>
                  Reset Password
                </button>
              </div>
            </>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Password Reset Successful!</h3>
              <p>Your password has been updated. Redirecting to sign in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}