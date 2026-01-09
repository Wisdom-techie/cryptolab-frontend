import "./Auth.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, verify2FA } from '../utils/api';

// COUNTRIES LIST
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// CURRENCIES LIST
const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
];

// PHONE CODES
const phoneCodes = [
  { country: "United States", code: "+1" },
  { country: "United Kingdom", code: "+44" },
  { country: "Canada", code: "+1" },
  { country: "Australia", code: "+61" },
  { country: "Germany", code: "+49" },
  { country: "France", code: "+33" },
  { country: "Italy", code: "+39" },
  { country: "Spain", code: "+34" },
  { country: "Netherlands", code: "+31" },
  { country: "Belgium", code: "+32" },
  { country: "Switzerland", code: "+41" },
  { country: "Austria", code: "+43" },
  { country: "Sweden", code: "+46" },
  { country: "Norway", code: "+47" },
  { country: "Denmark", code: "+45" },
  { country: "Finland", code: "+358" },
  { country: "Poland", code: "+48" },
  { country: "Portugal", code: "+351" },
  { country: "Greece", code: "+30" },
  { country: "Ireland", code: "+353" },
  { country: "China", code: "+86" },
  { country: "Japan", code: "+81" },
  { country: "South Korea", code: "+82" },
  { country: "India", code: "+91" },
  { country: "Singapore", code: "+65" },
  { country: "Hong Kong", code: "+852" },
  { country: "Malaysia", code: "+60" },
  { country: "Thailand", code: "+66" },
  { country: "Indonesia", code: "+62" },
  { country: "Philippines", code: "+63" },
  { country: "Vietnam", code: "+84" },
  { country: "United Arab Emirates", code: "+971" },
  { country: "Saudi Arabia", code: "+966" },
  { country: "Israel", code: "+972" },
  { country: "Turkey", code: "+90" },
  { country: "South Africa", code: "+27" },
  { country: "Egypt", code: "+20" },
  { country: "Nigeria", code: "+234" },
  { country: "Kenya", code: "+254" },
  { country: "Brazil", code: "+55" },
  { country: "Mexico", code: "+52" },
  { country: "Argentina", code: "+54" },
  { country: "Chile", code: "+56" },
  { country: "Colombia", code: "+57" },
  { country: "Peru", code: "+51" },
  { country: "Russia", code: "+7" },
  { country: "Ukraine", code: "+380" },
  { country: "New Zealand", code: "+64" },
];

export default function Auth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // Multi-step form
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+1",
    phoneNumber: "",
    country: "",
    currency: "USD",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreed: false,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 7) {
      setError("Valid phone number is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.country) {
      setError("Please select your country");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.agreed) {
      setError("You must agree to the terms to continue");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (isSignup) {
    if (currentStep === 1) {
      handleNext();
      return;
    }
    
    if (!validateStep2()) return;
    
    try {
      // Call backend API to register
      const response = await register(formData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      localStorage.setItem('isAuth', 'true');
      
      // Show success popup
      setShowPopup(true);
      
      setTimeout(() => {
        setShowPopup(false);
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  } else {
    // Login
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      // Check if 2FA is required
      if (response.data.requires2FA) {
        // Handle 2FA flow (you can implement this later)
        alert('2FA required - feature coming soon!');
        return;
      }
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      localStorage.setItem('isAuth', 'true');
      
      // Show success popup
      setShowPopup(true);
      
      setTimeout(() => {
        setShowPopup(false);
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  }
};

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-overlay">
          <h1>Cryptolab</h1>
          <p>Trade, manage and grow your crypto assets securely.</p>
          {isSignup && (
            <div className="auth-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                <span>1</span> Personal Info
              </div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                <span>2</span> Security
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>{isSignup ? "Create Account" : "Sign In"}</h2>
          
          {isSignup && (
            <p className="auth-subtitle">
              {currentStep === 1 ? "Step 1: Personal Information" : "Step 2: Security & Preferences"}
            </p>
          )}

          {/* SIGN IN FORM */}
          {!isSignup && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="auth-forgot">
                <a href="/forgot-password">Forgot password?</a>
              </div>
            </>
          )}

          {/* SIGN UP - STEP 1 */}
          {isSignup && currentStep === 1 && (
            <>
              <div className="input-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="phone-input-group">
                <select
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handleChange}
                  className="phone-code-select"
                >
                  {phoneCodes.map((item) => (
                    <option key={item.code + item.country} value={item.code}>
                      {item.code} {item.country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="phone-number-input"
                />
              </div>
            </>
          )}

          {/* SIGN UP - STEP 2 */}
          {isSignup && currentStep === 2 && (
            <>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select country of residence</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
              >
                <option value="">Select preferred currency</option>
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>

              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="referralCode"
                placeholder="Referral code (optional)"
                value={formData.referralCode}
                onChange={handleChange}
              />

              <div className="auth-agreement">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                />
                <p>
                  I confirm I am 18+ and agree to the{" "}
                  <a href="#">User Agreement</a>,{" "}
                  <a href="#">Privacy Policy</a> and{" "}
                  <a href="#">Cookie Policy</a>.
                </p>
              </div>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          {/* BUTTONS */}
          <div className="auth-buttons">
            {isSignup && currentStep === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="back-btn"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSignup && currentStep === 2 && !formData.agreed}
              className={isSignup && currentStep === 2 && !formData.agreed ? "disabled" : ""}
            >
              {isSignup ? (currentStep === 1 ? "Next" : "Create Account") : "Sign In"}
            </button>
          </div>

          <div className="auth-switch">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <span onClick={() => {
                  setIsSignup(false);
                  setCurrentStep(1);
                  setError("");
                }}>
                  Sign in
                </span>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <span onClick={() => {
                  setIsSignup(true);
                  setCurrentStep(1);
                  setError("");
                }}>
                  Create one
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="auth-popup">
          <div className="auth-popup-card">
             {isSignup ? "Account Created Successfully" : "Login Successful"}
          </div>
        </div>
      )}
    </div>
  );
}