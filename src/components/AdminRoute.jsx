import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAuth = localStorage.getItem("isAuth") === "true";
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');
  
  if (!isAuth) return <Navigate to="/auth" replace />;
  if (userData.role !== "admin") return <Navigate to="/home" replace />;

  return children;
}