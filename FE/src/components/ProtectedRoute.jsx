import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toUpperCase();

  if (!token) {
    // Chưa login → chuyển về login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole.toUpperCase()) {
    // Role không đúng → về home
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
