import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaTasks,
  FaClipboardCheck,
  FaFileAlt,
  FaClock,
  FaSignOutAlt,
  FaUserCog,
  FaBuilding,
  FaFileInvoiceDollar,
  FaBookOpen,
  FaChartLine,
  FaBox,
  FaChartBar,
} from "react-icons/fa";
import "./Sidebar.css";
import Button from "@components/ui/Button.jsx";

const Sidebar = ({ userName, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserName = userName || localStorage.getItem("fullName") || "Người dùng";
  const currentUserRole = userRole || localStorage.getItem("role") || "Khách";
  const role = currentUserRole.toLowerCase();
  let defaultHomePath = "/home";

  switch (role) {
    case "admin":
      defaultHomePath = "/admin";
      break;
    case "manager":
      defaultHomePath = "/manager";
      break;
    case "staff":
      defaultHomePath = "/staff";
      break;
    case "technician":
      defaultHomePath = "/technicantask";
      break;
    default:
      defaultHomePath = "/home";
      break;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem("sidebarOpen");
    navigate("/");
  };

  const isActive = (path, exact = false) => {
    if (exact) {

      return location.pathname === path;
    }

    if (path === "/home") return location.pathname === "/home";

    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar open">
      <div className="user-info">
        <h3>{currentUserName}</h3>
        <p>{currentUserRole}</p>
      </div>

      <div className="menu">
        <Link to={defaultHomePath} className={`menu-item ${isActive(defaultHomePath, true) ? "active" : ""}`}>
          <FaHome /> <span>Trang chủ</span>
        </Link>

        {(role === "staff") && (
          <Link to="/staff" className={`menu-item ${isActive("/staff", true) ? "active" : ""}`}>
            <FaCalendarCheck /> <span>Quản lý lịch hẹn</span>
          </Link>
        )}


        {role === "technician" && (
          <>
            <Link to="/technicantask" className={`menu-item ${isActive("/technicantask", true) ? "active" : ""}`}>
              <FaTasks /> <span>Công việc được giao</span>
            </Link>

            <Link to="/checklist" className={`menu-item ${isActive("/checklist") ? "active" : ""}`}>
              <FaClipboardCheck /> <span>Báo cáo kỹ thuật</span>
            </Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin" className={`menu-item ${isActive("/admin", true) ? "active" : ""}`}>
              <FaUserCog /> <span>Quản lý người dùng</span>
            </Link>
            <Link
              to="/admin/service-centers"
              className={`menu-item ${isActive("/admin/service-centers") ? "active" : ""}`}
            >
              <FaBuilding /> <span>Quản lý trung tâm</span>
            </Link>
            <Link
              to="/admin/bookings"
              className={`menu-item ${isActive("/admin/bookings") ? "active" : ""}`}
            >
              <FaBookOpen /> <span>Quản lý Booking</span>
            </Link>

            <Link
              to="/admin/payments"
              className={`menu-item ${isActive("/admin/payments") ? "active" : ""}`}
            >
              <FaFileInvoiceDollar /> <span>Quản lý Thanh toán</span>
            </Link>
            <Link
              to="/admin/analytics"
              className={`menu-item ${isActive("/admin/analytics") ? "active" : ""}`}
            >
              <FaChartLine /> <span>Phân tích thống kê</span>
            </Link>


          </>
        )}

        {role === "manager" && (
          <>
            <Link to="/manager" className={`menu-item ${isActive("/manager", true) ? "active" : ""}`}>
              <FaUserCog /> <span>Quản lý người dùng</span>
            </Link>
            <Link to="/manager/parts" className={`menu-item ${isActive("/manager/parts") ? "active" : ""}`}>
              <FaBox /> <span>Quản lý phụ tùng</span>
            </Link>
            <Link to="/manager/bookings" className={`menu-item ${isActive("/manager/bookings") ? "active" : ""}`}>
              <FaCalendarCheck /> <span>Quản lý Booking</span>
            </Link>
            <Link to="/manager/payments" className={`menu-item ${isActive("/manager/payments") ? "active" : ""}`}>
              <FaFileInvoiceDollar /> <span>Quản lý Thanh toán</span>
            </Link>
            <Link to="/manager/analytics" className={`menu-item ${isActive("/manager/analytics") ? "active" : ""}`}>
              <FaChartBar /> <span>Phân tích & Báo cáo</span>
            </Link>
          </>
        )}

        <div className="menu-footer">
          <Link
            to="/profile"
            className={`menu-item ${isActive("/profile") ? "active" : ""}`}
          >
            <FaUserCog /> <span>Tài khoản của tôi</span>
          </Link>

          <Button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Đăng xuất</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
