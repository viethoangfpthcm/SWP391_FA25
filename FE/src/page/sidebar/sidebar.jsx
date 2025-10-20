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
} from "react-icons/fa";
import "./sidebar.css";

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
    case "staff":
      defaultHomePath = "/staff";
      break;
    case "technician":
      defaultHomePath = "/technician-task";
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

  const isActive = (path) =>
    location.pathname === path || (location.pathname.startsWith(path) && path !== "/home");

  return (
    <div className="sidebar open">
      {/* THÔNG TIN NGƯỜI DÙNG */}
      <div className="user-info">
        <h3>{currentUserName}</h3>
        <p>{currentUserRole}</p>
      </div>

      {/* Main menu */}
      <div className="menu">
        {/* MENU ITEM: Trang chủ */}
        <Link to={defaultHomePath} className={`menu-item ${isActive(defaultHomePath) ? "active" : ""}`}>
          <FaHome /> <span>Trang chủ</span>
        </Link>

        {/* Mục Quản lý Lịch hẹn (Staff/Admin) */}
        {(role === "staff" || role === "admin") && (
          <Link to="/staff" className={`menu-item ${isActive("/staff") ? "active" : ""}`}>
            <FaCalendarCheck /> <span>Quản lý lịch hẹn</span>
          </Link>
        )}

        {/* Mục dành cho TECHNICIAN */}
        {role === "technician" && (
          <>
            <Link
              to="/technician-task"
              className={`menu-item ${isActive("/technician-task") ? "active" : ""}`}
            >
              <FaTasks /> <span>Công việc được giao</span>
            </Link>

            <Link to="/checklist" className={`menu-item ${isActive("/checklist") ? "active" : ""}`}>
              <FaClipboardCheck /> <span>Kiểm tra thực hiện</span>
            </Link>
          </>
        )}

        {/* Admin - Quản lý người dùng */}
        {role === "admin" && (
          <Link to="/admin" className={`menu-item ${isActive("/admin") ? "active" : ""}`}>
            <FaUserCog /> <span>Quản lý người dùng</span>
          </Link>
        )}

        {/* Biên bản đã tạo */}
        {(role === "technician" || role === "admin") && (
          <Link to="/reports" className={`menu-item ${isActive("/reports") ? "active" : ""}`}>
            <FaFileAlt /> <span>Biên bản đã tạo</span>
          </Link>
        )}

        {/* Lịch làm việc */}
        {role === "technician" && (
          <Link to="/schedule" className={`menu-item ${isActive("/schedule") ? "active" : ""}`}>
            <FaClock /> <span>Lịch làm việc</span>
          </Link>
        )}

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
