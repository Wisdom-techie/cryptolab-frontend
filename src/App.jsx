import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import CustomerSupport from './components/support/CustomerSupport';
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import BuyCrypto from "./pages/BuyCrypto";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import ForgotPassword from "./pages/ForgotPassword";
import Withdraw from "./pages/Withdraw";
import Trade from "./pages/Trade";

// Layout for PUBLIC pages (navbar + footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar isPublic={true} />
      {children}
      <Footer />
    </>
  );
}

// Layout for PROTECTED pages (navbar + footer)
function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar isPublic={false} />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route 
          path="/" 
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          } 
        />

        {/* AUTH PAGES - No navbar/footer */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/buy-crypto"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <BuyCrypto />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Withdraw />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Trade />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Customer Support Widget - Shows on ALL pages */}
      <CustomerSupport />
    </BrowserRouter>
  );
}

export default App;