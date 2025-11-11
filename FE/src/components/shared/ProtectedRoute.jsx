import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toUpperCase();

  if (!token) {
    // Chưa login → chuyển về login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole.toUpperCase()) {
    // Role không đúng → chuyển đến trang chính theo role (nếu có),
    // tránh đẩy người dùng về /home chung chung.
    const lowerRole = (localStorage.getItem("role") || "").toLowerCase();
    let defaultPath = "/home";
    switch (lowerRole) {
      case "admin":
        defaultPath = "/admin";
        break;
      case "manager":
        defaultPath = "/manager";
        break;
      case "staff":
        defaultPath = "/staff";
        break;
      case "technician":
        defaultPath = "/technicantask";
        break;
      case "customer":
        defaultPath = "/customer/dashboard";
        break;
      default:
        defaultPath = "/home";
        break;
    }

    return <Navigate to={defaultPath} replace />;
  }
  return children;
};

export default ProtectedRoute;
