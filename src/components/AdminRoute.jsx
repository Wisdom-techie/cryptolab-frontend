import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAuth = localStorage.getItem("isAuth") === "true";
  const role = localStorage.getItem("role");

  if (!isAuth) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/home" replace />;

  return children;
}
