import "./Dashboard.css";

import "./DashboardOverview.css";

import { useState, useEffect, useMemo, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import {

  getProfile,

  updateProfile,

  changePassword,

  getBalance,

  getTransactions,

  getLivePrices,

  getActivities,

} from "../utils/api";

import { cryptoAssets } from "../data/cryptoAssets";



/* ====================== CONFIG ====================== */



// Set to true if your backend stores each asset balance as a USD value

// instead of coin units (e.g. { BTC: 250 } meaning $250 of BTC).

const BALANCES_ARE_USD = false;



const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];

const ASSET_META = Object.fromEntries(cryptoAssets.map((a) => [a.symbol, a]));

const STABLES = ["USDT", "USDC"]; // always valued at exactly $1.00



const TX_META = {

  deposit: { label: "Deposit", sign: "+", icon: "↓" },

  buy: { label: "Buy", sign: "+", icon: "＋" },

  withdrawal: { label: "Withdrawal", sign: "−", icon: "↑" },

  sell: { label: "Sell", sign: "−", icon: "⇄" },

};



/* ====================== HELPERS ====================== */



const fmtUsd = (n) =>

  `$${(Number(n) || 0).toLocaleString("en-US", {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  })}`;



const fmtUnits = (n) => {

  const v = Number(n) || 0;

  if (v === 0) return "0";

  if (v < 0.0001) return v.toFixed(8);

  return v.toLocaleString("en-US", { maximumFractionDigits: 6 });

};



const formatLongDate = (value) => {

  const d = value ? new Date(value) : new Date();

  return d.toLocaleString("en-US", {

    month: "long",

    day: "numeric",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",

    hour12: true,

  });

};



const formatShortDate = (value) => {

  if (!value) return "";

  return new Date(value).toLocaleDateString("en-US", {

    month: "short",

    day: "numeric",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

};



// Stable fallback referral code (same email -> same code, never changes between renders)

const codeFromEmail = (email = "") => {

  let h = 5381;

  for (const ch of email.toLowerCase()) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;

  return `CRYPTO${h.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;

};



// Server activity -> display shape

const normalizeActivity = (a) => ({

  id: a._id || a.id,

  action: a.action,

  details: a.details,

  createdAt: a.createdAt || a.timestamp,

  date: a.date || formatShortDate(a.createdAt || a.timestamp),

});



// Your backend currently logs every login twice (\~1s apart). Hide the repeats.

const dedupeActivities = (list) => {

  const out = [];

  for (const a of list) {

    const prev = out[out.length - 1];

    const repeat =

      prev &&

      prev.action === a.action &&

      prev.details === a.details &&

      Math.abs(new Date(prev.createdAt) - new Date(a.createdAt)) < 5000;

    if (!repeat) out.push(a);

  }

  return out;

};



// Admin balance edits are only stored as activity text, e.g.

// "Balance changed from 1000 to 7000 USDT. Reason: Deposit"

// Turn those into transaction-style rows for the feed.

const ADMIN_RE = /from\s+([\d.,]+)\s+to\s+([\d.,]+)\s+([A-Za-z0-9]+)**\\.**?\s*(?:Reason:\s*(.*))?$/i;



const adminAdjustmentToTx = (a) => {

  if (!/balance updated by admin/i.test(a.action || "")) return null;

  const m = ADMIN_RE.exec(a.details || "");

  if (!m) return null;

  const from = parseFloat(m[1].replace(/,/g, ""));

  const to = parseFloat(m[2].replace(/,/g, ""));

  const diff = to - from;

  if (!diff) return null;

  return {

    id: `admin-${a.id}`,

    type: diff > 0 ? "deposit" : "withdrawal",

    asset: m[3].toUpperCase(),

    amount: Math.abs(diff),

    status: "completed",

    createdAt: a.createdAt,

    note: (m[4] || "").trim(),

  };

};



const txTime = (t) => new Date(t.createdAt || t.date || t.timestamp || 0).getTime() || 0;



// Shrink uploaded avatars so they fit comfortably in localStorage

const resizeImage = (file, max = 256) =>

  new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onerror = reject;

    reader.onload = () => {

      const img = new Image();

      img.onerror = reject;

      img.onload = () => {

        const scale = Math.min(1, max / Math.max(img.width, img.height));

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);

        canvas.height = Math.round(img.height * scale);

        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.85));

      };

      img.src = reader.result;

    };

    reader.readAsDataURL(file);

  });



/* ====================== SMALL COMPONENTS ====================== */



function DonutChart({ slices, total }) {

  const radius = 70;

  const circumference = 2 * Math.PI * radius;



  const segments = [];

  let acc = 0;

  for (const s of slices) {

    const dash = total > 0 ? (s.usd / total) * circumference : 0;

    segments.push({ ...s, dash, offset: acc });

    acc += dash;

  }



  return (

    <svg viewBox="0 0 180 180" className="ov-donut">

      <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="22" />

      {segments.map((s) => (

        <circle

          key={s.symbol}

          cx="90"

          cy="90"

          r={radius}

          fill="none"

          stroke={s.color}

          strokeWidth="22"

          strokeDasharray={`${s.dash} ${circumference - s.dash}`}

          strokeDashoffset={-s.offset}

          transform="rotate(-90 90 90)"

        />

      ))}

    </svg>

  );

}



function AssetBadge({ symbol, logo }) {

  return logo ? (

    <img className="ov-asset-logo" src={logo} alt={symbol} />

  ) : (

    <div className="ov-asset-logo ov-asset-fallback">{symbol.slice(0, 2)}</div>

  );

}



function HoldingRow({ h, showBalance = true }) {

  const up = h.change >= 0;

  return (

    <div className="ov-row">

      <AssetBadge symbol={h.symbol} logo={h.logo} />

      <div className="ov-row-main">

        <strong>{h.symbol}</strong>

        <span>{showBalance ? fmtUnits(h.units) : "******"}</span>

      </div>

      <div className="ov-row-side">

        <strong>{showBalance ? fmtUsd(h.usd) : "******"}</strong>

        <span className={up ? "ov-up" : "ov-down"}>

          {showBalance ? `${up ? "+" : ""}${h.change.toFixed(2)}%` : "******"}

        </span>

      </div>

    </div>

  );

}



function TxRow({ tx }) {

  const meta = TX_META[tx.type] || { label: tx.type || "Transaction", sign: "", icon: "•" };

  const status = (tx.status || "completed").toLowerCase();

  const when = formatShortDate(tx.createdAt || tx.date || tx.timestamp);

  return (

    <div className="ov-row">

      <div className={`ov-tx-icon ${meta.sign === "−" ? "out" : "in"}`}>{meta.icon}</div>

      <div className="ov-row-main">

        <strong>

          {meta.label} {tx.asset}

        </strong>

        <span>

          {when}

          {tx.note ? ` · ${tx.note}` : ""}

        </span>

      </div>

      <div className="ov-row-side">

        <strong>

          {meta.sign}

          {fmtUnits(tx.amount)} {tx.asset}

        </strong>

        <span className={`ov-chip ${status}`}>{status}</span>

      </div>

    </div>

  );

}



/* ====================== MAIN COMPONENT ====================== */



export default function Dashboard() {

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");



  // ---- User / profile ----

  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem("userData") || "{}"));

  const [serverProfile, setServerProfile] = useState(null);

  const [formData, setFormData] = useState({

    firstName: userData.firstName || "",

    lastName: userData.lastName || "",

    email: userData.email || "",

    phoneCode: userData.phoneCode || "+1",

    phoneNumber: userData.phoneNumber || "",

    country: userData.country || "",

    currency: userData.currency || "USD",

  });

  const [savingProfile, setSavingProfile] = useState(false);



  // Avatar is saved per account (keyed by email) so it survives refresh

  const avatarKey = `profileImage:${(userData.email || "").toLowerCase()}`;

  const [profileImage, setProfileImage] = useState(() => localStorage.getItem(avatarKey));



  // ---- 2FA ----

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(localStorage.getItem("twoFactorEnabled") === "true");

  const [twoFactorCode, setTwoFactorCode] = useState(localStorage.getItem("twoFactorCode") || "");

  const [newTwoFactorCode, setNewTwoFactorCode] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");



  // ---- ID verification ----

  const [idVerifiedLocal] = useState(localStorage.getItem("idVerified") === "true");

  const idVerified = serverProfile?.idVerified ?? idVerifiedLocal;



  // ---- Password ----

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [savingPassword, setSavingPassword] = useState(false);



  // ---- Activity / sessions ----

  const [localActivities, setLocalActivities] = useState(() => {

    const saved = localStorage.getItem("userActivities");

    return saved ? JSON.parse(saved) : [];

  });

  const [serverActivities, setServerActivities] = useState(null); // null until loaded

  const [activityLimit, setActivityLimit] = useState(15);

  const [localSessions] = useState(() => {

    const saved = localStorage.getItem("userSessions");

    return saved ? JSON.parse(saved) : [];

  });



  // ---- Portfolio ----

  const [balanceData, setBalanceData] = useState(null);

  const [prices, setPrices] = useState({});

  const [transactions, setTransactions] = useState([]);

  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const [portfolioError, setPortfolioError] = useState("");

  const [showAllTx, setShowAllTx] = useState(false);

  // OPay-style balance privacy toggle (preference persists on this device)
  const [showBalance, setShowBalance] = useState(() => localStorage.getItem("showBalance") !== "false");
  const toggleBalanceVisibility = () => {
    setShowBalance((previous) => {
      const next = !previous;
      localStorage.setItem("showBalance", String(next));
      return next;
    });
  };
  const maskBalance = (value) => (showBalance ? value : "******");



  const loadPortfolio = useCallback(async () => {

    const [balRes, priceRes, txRes, profileRes, actRes] = await Promise.allSettled([

      getBalance(),

      getLivePrices(),

      getTransactions(),

      getProfile(),

      getActivities(),

    ]);



    if (balRes.status === "fulfilled") {

      setBalanceData(balRes.value.data);

    } else {

      setPortfolioError("Couldn't load your balance. Tap Refresh to try again.");

    }



    if (priceRes.status === "fulfilled") {

      setPrices(priceRes.value.data?.prices || {});

    }



    if (txRes.status === "fulfilled") {

      const d = txRes.value.data;

      setTransactions(Array.isArray(d) ? d : d?.transactions || []);

    }



    if (actRes.status === "fulfilled") {

      const list = actRes.value.data?.activities;

      if (Array.isArray(list)) {

        const sorted = list

          .map(normalizeActivity)

          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setServerActivities(dedupeActivities(sorted));

      }

    }



    if (profileRes.status === "fulfilled") {

      const u = profileRes.value.data?.user || profileRes.value.data;

      if (u && typeof u === "object") {

        setServerProfile(u);

        setFormData((prev) => ({

          firstName: u.firstName ?? prev.firstName,

          lastName: u.lastName ?? prev.lastName,

          email: u.email ?? prev.email,

          phoneCode: u.phoneCode ?? prev.phoneCode,

          phoneNumber: u.phoneNumber ?? prev.phoneNumber,

          country: u.country ?? prev.country,

          currency: u.currency ?? prev.currency,

        }));

      }

    }



    setPortfolioLoading(false);

  }, []);



  useEffect(() => {

    loadPortfolio();

  }, [loadPortfolio]);



  const refreshPortfolio = () => {

    setPortfolioLoading(true);

    setPortfolioError("");

    loadPortfolio();

  };



  // Server history wins; local list is only a fallback

  const activities = serverActivities ?? localActivities;



  const serverLogins = useMemo(

    () => (serverActivities || []).filter((a) => /^login/i.test(a.action || "")),

    [serverActivities]

  );



  // ---- Derived portfolio numbers ----

  const holdings = useMemo(() => {

    const raw = balanceData?.balances ?? balanceData?.user?.balances;

    const rows = [];



    if (raw && typeof raw === "object") {

      Object.entries(raw).forEach(([symbol, value]) => {

        const amount = Number(value) || 0;

        if (amount <= 0) return;

        const isStable = STABLES.includes(symbol);

        const live = prices[symbol];

        const meta = ASSET_META[symbol];

        const price = isStable ? 1 : live?.price ?? meta?.price ?? 0;

        const change = isStable ? 0 : live?.change24h ?? meta?.change ?? 0;

        rows.push({

          symbol,

          name: meta?.name || symbol,

          logo: meta?.logo,

          units: BALANCES_ARE_USD ? (price ? amount / price : 0) : amount,

          usd: BALANCES_ARE_USD ? amount : amount * price,

          price,

          change,

        });

      });

    } else if (typeof balanceData?.balance === "number" && balanceData.balance > 0) {

      rows.push({

        symbol: "USD",

        name: "Cash balance",

        logo: null,

        units: balanceData.balance,

        usd: balanceData.balance,

        price: 1,

        change: 0,

      });

    }



    return rows.sort((a, b) => b.usd - a.usd);

  }, [balanceData, prices]);



  const portfolio = useMemo(() => {

    const totalUsd = holdings.reduce((s, h) => s + h.usd, 0);

    const prevUsd = holdings.reduce((s, h) => s + h.usd / (1 + (h.change || 0) / 100), 0);

    const changeUsd = totalUsd - prevUsd;

    const changePct = prevUsd > 0 ? (changeUsd / prevUsd) * 100 : 0;

    return { totalUsd, changeUsd, changePct };

  }, [holdings]);



  const slices = useMemo(() => {

    const top = holdings.slice(0, 5).map((h, i) => ({

      symbol: h.symbol,

      usd: h.usd,

      color: CHART_COLORS[i],

    }));

    const rest = holdings.slice(5).reduce((s, h) => s + h.usd, 0);

    if (rest > 0) top.push({ symbol: "Other", usd: rest, color: CHART_COLORS[5] });

    return top;

  }, [holdings]);



  // Feed = real transactions + admin balance adjustments (parsed from activity log)

  const feed = useMemo(() => {

    const derived = (serverActivities || []).map(adminAdjustmentToTx).filter(Boolean);

    const isDuplicate = (d) =>

      transactions.some(

        (t) =>

          t.asset === d.asset &&

          Math.abs(Number(t.amount) - d.amount) < 1e-9 &&

          Math.abs(txTime(t) - txTime(d)) < 120000

      );

    return [...transactions, ...derived.filter((d) => !isDuplicate(d))].sort((a, b) => txTime(b) - txTime(a));

  }, [transactions, serverActivities]);



  const btcPrice = prices.BTC?.price ?? ASSET_META.BTC?.price ?? 0;

  const visibleTx = showAllTx ? feed : feed.slice(0, 6);

  const changeUp = portfolio.changeUsd >= 0;



  // ---- Referral ----

  const referralCode =

    serverProfile?.referralCode || userData.referralCode || codeFromEmail(formData.email || userData.email);



  // ---- Last login (from real login history when available) ----

  const lastLogin = formatLongDate(

    serverProfile?.lastLogin || serverLogins[0]?.createdAt || localStorage.getItem("loginTime")

  );



  // ---- Sessions (real login history, falling back to local) ----

  const sessionRows = serverLogins.length

    ? serverLogins.slice(0, 30).map((a) => ({

        loginTime: a.createdAt,

        logoutTime: null,

        month: new Date(a.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),

      }))

    : localSessions;



  const sessionsByMonth = {};

  sessionRows.forEach((session) => {

    if (!sessionsByMonth[session.month]) sessionsByMonth[session.month] = [];

    sessionsByMonth[session.month].push(session);

  });



  /* ---------- activity log (local fallback) ---------- */

  const logActivity = (action, details) => {

    const entry = {

      id: Date.now(),

      action,

      details,

      date: new Date().toLocaleDateString("en-US", {

        month: "short",

        day: "numeric",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

    setLocalActivities((prev) => {

      const next = [entry, ...prev].slice(0, 50);

      localStorage.setItem("userActivities", JSON.stringify(next));

      return next;

    });

  };



  /* ---------- handlers ---------- */

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

  };



  const handleImageUpload = async (e) => {

    const input = e.target;

    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      alert("Please choose an image file");

      return;

    }

    try {

      const dataUrl = await resizeImage(file);

      setProfileImage(dataUrl);

      localStorage.setItem(avatarKey, dataUrl);

      logActivity("Profile Update", "Changed profile picture");

    } catch {

      alert("Couldn't read that image. Try another one.");

    }

    input.value = "";

  };



  const handleDeleteAvatar = () => {

    setProfileImage(null);

    localStorage.removeItem(avatarKey);

    logActivity("Profile Update", "Deleted profile picture");

  };



  const saveProfileLocally = () => {

    const updated = { ...userData, ...formData };

    localStorage.setItem("userData", JSON.stringify(updated));

    setUserData(updated);

  };



  const handleUpdateProfile = async () => {

    setSavingProfile(true);

    try {

      await updateProfile({

        firstName: formData.firstName,

        lastName: formData.lastName,

        phoneCode: formData.phoneCode,

        phoneNumber: formData.phoneNumber,

        country: formData.country,

        currency: formData.currency,

      });

      saveProfileLocally();

      logActivity("Profile Update", "Updated personal information");

      alert("Profile updated successfully!");

    } catch (err) {

      if (err.response?.status === 404) {

        // Backend has no profile-update route yet: keep the old on-device behaviour

        saveProfileLocally();

        logActivity("Profile Update", "Updated personal information (this device only)");

        alert("Saved on this device only — the server has no profile-update route yet.");

      } else {

        alert(err.response?.data?.message || "Failed to update profile");

      }

    } finally {

      setSavingProfile(false);

    }

  };



  // 2FA

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



  // Password (verified by the backend; no more fake success)

  const handleChangePassword = async () => {

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



    setSavingPassword(true);

    try {

      await changePassword(currentPassword, newPassword);

      logActivity("Security Update", "Changed password");

      setCurrentPassword("");

      setNewPassword("");

      setConfirmNewPassword("");

      alert("Password changed successfully!");

    } catch (err) {

      setPasswordError(

        err.response?.status === 404

          ? "Password change isn't available on the server yet."

          : err.response?.data?.message || "Failed to change password"

      );

    } finally {

      setSavingPassword(false);

    }

  };



  const handleStartVerification = () => {

    logActivity("Verification", "Started ID verification process");

    alert("Redirecting to ID.me for verification...");

    // In production: window\.open("https\://www\.id.me/", "_blank");

  };



  const handleCopyReferral = async () => {

    try {

      await navigator.clipboard.writeText(referralCode);

      alert("Referral code copied!");

    } catch {

      alert(`Couldn't copy automatically. Your code: ${referralCode}`);

    }

  };



  const handleLogout = () => {

    const currentSession = {

      loginTime: localStorage.getItem("loginTime") || new Date().toISOString(),

      logoutTime: new Date().toISOString(),

      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),

    };

    const updatedSessions = [currentSession, ...localSessions].slice(0, 20);

    localStorage.setItem("userSessions", JSON.stringify(updatedSessions));



    localStorage.removeItem("token"); // previously left behind after logout

    localStorage.removeItem("isAuth");

    localStorage.removeItem("userData");

    localStorage.removeItem("loginTime");

    navigate("/");

  };



  /* ---------- menu ---------- */

  const menuItems = [

    {

      id: "overview",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <rect x="3" y="3" width="7" height="7" />

          <rect x="14" y="3" width="7" height="7" />

          <rect x="14" y="14" width="7" height="7" />

          <rect x="3" y="14" width="7" height="7" />

        </svg>

      ),

      label: "Overview",

    },

    {

      id: "profile",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

          <circle cx="12" cy="7" r="4" />

        </svg>

      ),

      label: "Profile",

    },

    {

      id: "wallet",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />

          <line x1="1" y1="10" x2="23" y2="10" />

        </svg>

      ),

      label: "Wallet",

    },

    {

      id: "activity",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <line x1="12" y1="20" x2="12" y2="10" />

          <line x1="18" y1="20" x2="18" y2="4" />

          <line x1="6" y1="20" x2="6" y2="16" />

        </svg>

      ),

      label: "Activity",

    },

    {

      id: "2fa",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />

          <path d="M7 11V7a5 5 0 0 1 10 0v4" />

        </svg>

      ),

      label: "2FA Security",

    },

    {

      id: "password",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <circle cx="12" cy="12" r="3" />

          <path d="M12 1v6m0 6v6m6-12l-6 6m0 0L6 7m6 6l6 6m-6-6l-6 6" />

        </svg>

      ),

      label: "Password",

    },

    {

      id: "verification",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />

          <polyline points="22 4 12 14.01 9 11.01" />

        </svg>

      ),

      label: "ID Verification",

    },

    {

      id: "sessions",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />

          <line x1="8" y1="21" x2="16" y2="21" />

          <line x1="12" y1="17" x2="12" y2="21" />

        </svg>

      ),

      label: "Sessions History",

    },

    {

      id: "referrals",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

          <circle cx="9" cy="7" r="4" />

          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

          <path d="M16 3.13a4 4 0 0 1 0 7.75" />

        </svg>

      ),

      label: "Referrals",

    },

    {

      id: "voucher",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />

          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />

          <line x1="12" y1="22.08" x2="12" y2="12" />

        </svg>

      ),

      label: "Voucher",

    },

    {

      id: "logout",

      icon: (

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

          <polyline points="16 17 21 12 16 7" />

          <line x1="21" y1="12" x2="9" y2="12" />

        </svg>

      ),

      label: "Log out",

    },

  ];



  const handleMenuClick = (id) => {

    if (id === "logout") {

      handleLogout();

    } else {

      setActiveSection(id);

    }

  };



  const activeLabel = menuItems.find((i) => i.id === activeSection)?.label;



  const emptyPortfolio = (

    <div className="ov-empty">

      <p>No assets yet — make your first deposit to get started.</p>

      <button className="ov-action primary" onClick={() => navigate("/buy-crypto")}>

        Buy crypto

      </button>

    </div>

  );



  /* ====================== RENDER ====================== */

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

          <h1 className="ov-page-title">{activeLabel}</h1>

          {activeSection === "overview" && (

            <p className="ov-greeting">

              Welcome back{formData.firstName ? `, ${formData.firstName}` : ""} 👋

            </p>

          )}



          {/* OVERVIEW */}

          {activeSection === "overview" && (

            <div className="ov-grid">

              {/* Balance + quick actions */}

              <div className="ov-card ov-balance-card ov-span-2">

                <div className="ov-balance-top">
                  <span className="ov-label">Total balance</span>
                  <div className="ov-balance-controls">
                    <button type="button" className="ov-visibility-toggle" onClick={toggleBalanceVisibility}
                      aria-label={showBalance ? "Hide balances" : "Show balances"}
                      title={showBalance ? "Hide balances" : "Show balances"}>
                      {showBalance ? "◉" : "◎"}
                    </button>
                    <button className="ov-refresh" onClick={refreshPortfolio} disabled={portfolioLoading}>
                      {portfolioLoading ? "Refreshing…" : "↻ Refresh"}
                    </button>
                  </div>
                </div>
                <div className="ov-balance-amount">
                  {portfolioLoading && !balanceData ? "…" : maskBalance(fmtUsd(portfolio.totalUsd))}
                </div>
                <div className={`ov-change ${changeUp ? "ov-up" : "ov-down"}`}>
                  {showBalance ? `${changeUp ? "+" : "−"}${fmtUsd(Math.abs(portfolio.changeUsd))} (${changeUp ? "+" : ""}${portfolio.changePct.toFixed(2)}%)` : "******"}
                  <span>24h</span>
                </div>

                {portfolioError && <p className="ov-error">{portfolioError}</p>}



                <div className="ov-actions">

                  <button className="ov-action primary" onClick={() => navigate("/buy-crypto")}>

                    ↓ Deposit

                  </button>

                  <button className="ov-action" onClick={() => navigate("/withdraw")}>

                    ↑ Withdraw

                  </button>

                  <button className="ov-action" onClick={() => navigate("/trade")}>

                    ⇄ Trade

                  </button>

                </div>

              </div>



              {/* Allocation */}

              <div className="ov-card">

                <div className="ov-card-head">

                  <h3>Allocation</h3>

                </div>

                {holdings.length === 0 ? (

                  portfolioLoading ? (

                    <p className="ov-empty">Loading…</p>

                  ) : (

                    emptyPortfolio

                  )

                ) : (

                  <div className="ov-alloc">

                    <div className="ov-donut-wrap">

                      <DonutChart slices={slices} total={portfolio.totalUsd} />

                      <div className="ov-donut-center">

                        <strong>{holdings.length}</strong>

                        <small>{holdings.length === 1 ? "asset" : "assets"}</small>

                      </div>

                    </div>

                    <ul className="ov-legend">

                      {slices.map((s) => (

                        <li key={s.symbol}>

                          <span className="ov-dot" style={{ background: s.color }} />

                          <span>{s.symbol}</span>

                          <span className="ov-pct">

                            {portfolio.totalUsd > 0 ? ((s.usd / portfolio.totalUsd) * 100).toFixed(1) : "0.0"}%

                          </span>

                        </li>

                      ))}

                    </ul>

                  </div>

                )}

              </div>



              {/* Top holdings */}

              <div className="ov-card">

                <div className="ov-card-head">

                  <h3>Your assets</h3>

                  {holdings.length > 0 && (

                    <button className="ov-link" onClick={() => setActiveSection("wallet")}>

                      View all

                    </button>

                  )}

                </div>

                {holdings.length === 0 ? (

                  <p className="ov-empty">{portfolioLoading ? "Loading…" : "Nothing here yet"}</p>

                ) : (

                  <div className="ov-list">

                    {holdings.slice(0, 5).map((h) => (

                      <HoldingRow key={h.symbol} h={h} showBalance={showBalance} />

                    ))}

                  </div>

                )}

              </div>



              {/* Recent transactions */}

              <div className="ov-card ov-span-2">

                <div className="ov-card-head">

                  <h3>Recent activity</h3>

                  {feed.length > 6 && (

                    <button className="ov-link" onClick={() => setShowAllTx((v) => !v)}>

                      {showAllTx ? "Show less" : `Show all (${feed.length})`}

                    </button>

                  )}

                </div>

                {visibleTx.length === 0 ? (

                  <p className="ov-empty">{portfolioLoading ? "Loading…" : "No transactions yet"}</p>

                ) : (

                  <div className="ov-list">

                    {visibleTx.map((tx, i) => (

                      <TxRow key={tx._id || tx.id || i} tx={tx} />

                    ))}

                  </div>

                )}

              </div>

            </div>

          )}



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

                        {formData.firstName?.[0]}

                        {formData.lastName?.[0]}

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

                    <input

                      type="text"

                      name="firstName"

                      value={formData.firstName}

                      onChange={handleInputChange}

                      placeholder="e.g., John"

                    />

                  </div>

                  <div className="form-group">

                    <label>Last name</label>

                    <input

                      type="text"

                      name="lastName"

                      value={formData.lastName}

                      onChange={handleInputChange}

                      placeholder="e.g., Doe"

                    />

                  </div>

                </div>



                <div className="form-group">

                  <label>Email</label>

                  <input

                    type="email"

                    value={formData.email}

                    disabled

                    style={{ opacity: 0.6, cursor: "not-allowed" }}

                  />

                  <p className="field-note">

                    Email cannot be changed for security reasons. Contact support if needed.

                  </p>

                </div>



                <div className="form-group">

                  <label>Last Login</label>

                  <input type="text" value={lastLogin} disabled />

                </div>



                <button className="update-btn" onClick={handleUpdateProfile} disabled={savingProfile}>

                  {savingProfile ? "Saving..." : "Update Profile"}

                </button>

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

                  <p className="wallet-amount">{maskBalance(fmtUsd(portfolio.totalUsd))}</p>

                  <span className="wallet-crypto">

                    {maskBalance(`${btcPrice > 0 ? (portfolio.totalUsd / btcPrice).toFixed(8) : "0.00000000"} BTC`)}

                  </span>

                </div>

                <div className="wallet-card">

                  <h3>Available Balance</h3>

                  <p className="wallet-amount">{maskBalance(fmtUsd(portfolio.totalUsd))}</p>

                  <span className="wallet-crypto">

                    {maskBalance(`${btcPrice > 0 ? (portfolio.totalUsd / btcPrice).toFixed(8) : "0.00000000"} BTC`)}

                  </span>

                </div>

              </div>



              <div className="wallet-actions">

                <button className="action-button primary" onClick={() => navigate("/buy-crypto")}>

                  Deposit

                </button>

                <button className="action-button secondary" onClick={() => navigate("/withdraw")}>

                  Withdraw

                </button>

              </div>



              <div className="ov-wallet-list">

                {holdings.length === 0 ? (

                  portfolioLoading ? (

                    <p className="ov-empty">Loading…</p>

                  ) : (

                    emptyPortfolio

                  )

                ) : (

                  <div className="ov-list">

                    {holdings.map((h) => (

                      <HoldingRow key={h.symbol} h={h} showBalance={showBalance} />

                    ))}

                  </div>

                )}

              </div>

            </div>

          )}



          {/* ACTIVITY */}

          {activeSection === "activity" && (

            <div className="content-section">

              <h2>Activity History</h2>

              <div className="activity-list">

                {activities.length === 0 ? (

                  <p className="empty-state">{portfolioLoading ? "Loading..." : "No recent activity"}</p>

                ) : (

                  activities.slice(0, activityLimit).map((activity) => (

                    <div key={activity.id} className="activity-item">

                      <div className="activity-icon">

                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />

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

              {activities.length > activityLimit && (

                <button

                  className="ov-link"

                  style={{ display: "block", margin: "1rem auto 0" }}

                  onClick={() => setActivityLimit((n) => n + 15)}

                >

                  Show more ({activities.length - activityLimit} older)

                </button>

              )}

            </div>

          )}



          {/* 2FA */}

          {activeSection === "2fa" && (

            <div className="content-section">

              <h2>Two-Factor Authentication</h2>

              <div className="twofa-content">

                <div className="info-box">

                  <h3>Enhance Your Security</h3>

                  <p>

                    Two-factor authentication adds an extra layer of security to your account. You'll need to

                    provide a 6-digit code along with your password when logging in.

                  </p>

                  {twoFactorEnabled && (

                    <p style={{ marginTop: "1rem", color: "#10b981" }}>

                      ✓ Current Code: {twoFactorCode ? "••••••" : "Not set"}

                    </p>

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

                        onChange={(e) => setNewTwoFactorCode(e.target.value.replace(/\D/g, ""))}

                        style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" }}

                      />

                    </div>

                    <div className="form-group">

                      <label>Confirm Password</label>

                      <input

                        type="password"

                        placeholder="Enter your password"

                        value={confirmPassword}

                        onChange={(e) => setConfirmPassword(e.target.value)}

                      />

                    </div>

                    <button className="action-button primary" onClick={handleEnable2FA}>

                      Enable 2FA

                    </button>

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

                        onChange={(e) => setNewTwoFactorCode(e.target.value.replace(/\D/g, ""))}

                        style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" }}

                      />

                    </div>

                    <div className="form-group">

                      <label>Confirm Password</label>

                      <input

                        type="password"

                        placeholder="Enter your password"

                        value={confirmPassword}

                        onChange={(e) => setConfirmPassword(e.target.value)}

                      />

                    </div>

                    <div className="twofa-button-group">

                      <button className="action-button primary" onClick={handleChange2FA}>

                        Change Code

                      </button>

                      <button className="action-button secondary" onClick={handleDisable2FA}>

                        Disable 2FA

                      </button>

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

                <input

                  type="password"

                  placeholder="Enter current password"

                  value={currentPassword}

                  onChange={(e) => setCurrentPassword(e.target.value)}

                />

              </div>

              <div className="form-group">

                <label>New Password</label>

                <input

                  type="password"

                  placeholder="Enter new password (min 6 characters)"

                  value={newPassword}

                  onChange={(e) => setNewPassword(e.target.value)}

                />

              </div>

              <div className="form-group">

                <label>Confirm New Password</label>

                <input

                  type="password"

                  placeholder="Confirm new password"

                  value={confirmNewPassword}

                  onChange={(e) => setConfirmNewPassword(e.target.value)}

                />

                {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (

                  <p className="field-note" style={{ color: "#ef4444" }}>

                    Passwords do not match

                  </p>

                )}

                {newPassword && confirmNewPassword && newPassword === confirmNewPassword && (

                  <p className="field-note" style={{ color: "#10b981" }}>

                    ✓ Passwords match

                  </p>

                )}

              </div>

              <button className="update-btn" onClick={handleChangePassword} disabled={savingPassword}>

                {savingPassword ? "Updating..." : "Update Password"}

              </button>

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

                      <p>

                        Complete identity verification through ID.me to access advanced features and increase

                        your withdrawal limits.

                      </p>

                      <div className="verification-provider">

                        <img

                          src="https\://developers.id.me/assets/images/logo.svg"

                          alt="ID.me"

                          style={{ width: "120px", margin: "1.5rem 0" }}

                        />

                        <p style={{ fontSize: "0.9rem", color: "#888" }}>

                          Powered by ID.me - Trusted identity verification

                        </p>

                      </div>

                      <button className="action-button primary" onClick={handleStartVerification}>

                        Verify with ID.me

                      </button>

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

              <p className="section-subtitle">View your login history organized by month</p>



              {Object.keys(sessionsByMonth).length === 0 ? (

                <div className="sessions-list">

                  <div className="session-item">

                    <div className="session-info">

                      <h4>Current Session</h4>

                      <div className="session-times">

                        <p>

                          <strong>Login:</strong> {lastLogin}

                        </p>

                        <p>

                          <strong>Status:</strong> <span className="session-active">Active</span>

                        </p>

                      </div>

                      <span className="session-device">Web Browser</span>

                    </div>

                  </div>

                </div>

              ) : (

                Object.keys(sessionsByMonth).map((month) => (

                  <div key={month} className="session-month-group">

                    <h3 className="month-header">{month}</h3>

                    <div className="sessions-list">

                      {sessionsByMonth[month].map((session, index) => (

                        <div key={index} className="session-item">

                          <div className="session-info">

                            <h4>Session {index + 1}</h4>

                            <div className="session-times">

                              <p>

                                <strong>Login:</strong> {new Date(session.loginTime).toLocaleString()}

                              </p>

                              {session.logoutTime && (

                                <p>

                                  <strong>Logout:</strong> {new Date(session.logoutTime).toLocaleString()}

                                </p>

                              )}

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

                    <code>{referralCode}</code>

                    <button className="copy-btn" onClick={handleCopyReferral}>

                      Copy

                    </button>

                  </div>

                  <p>Share your code and earn rewards when friends sign up!</p>

                </div>

                <div className="referral-stats">

                  <div className="stat-item">

                    <span className="stat-label">Total Referrals</span>

                    <span className="stat-value">{serverProfile?.referralCount ?? 0}</span>

                  </div>

                  <div className="stat-item">

                    <span className="stat-label">Earnings</span>

                    <span className="stat-value">{fmtUsd(serverProfile?.referralEarnings ?? 0)}</span>

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