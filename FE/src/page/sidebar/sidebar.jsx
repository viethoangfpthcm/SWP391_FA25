import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHouse,
  FaCalendarCheck,
  FaListCheck,
  FaClipboardCheck,
  FaFileLines,
  FaClock,
  FaRightFromBracket,
  FaUsers,
  FaBox
} from "react-icons/fa6";
import "./sidebar.css";

const Sidebar = ({ userName, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserName = userName || localStorage.getItem('fullName') || "Người dùng";
  const currentUserRole = userRole || localStorage.getItem('role') || "Khách";
  const role = currentUserRole.toLowerCase();
  
  let defaultHomePath = "/home"; 
  if (role === "admin") defaultHomePath = "/admin";
  else if (role === "staff") defaultHomePath = "/staff";
  else if (role === "technician") defaultHomePath = "/technician-task";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path || (location.pathname.startsWith(path) && path !== "/home");

  return (
    <div className="sidebar open">
      <div className="user-info">
        <h3>{currentUserName}</h3>
        <p>{currentUserRole}</p>
      </div>

      <div className="menu">
        <Link to={defaultHomePath} className={`menu-item ${isActive(defaultHomePath) ? 'active' : ''}`}>
          <FaHouse /> <span>Trang chủ</span>
        </Link>

        {/* Admin */}
        {role === 'admin' && (
          <>
            <Link to="/admin/users" className={`menu-item ${isActive('/admin/users') ? 'active' : ''}`}>
              <FaUsers /> <span>Quản lý Users</span>
            </Link>
            <Link to="/admin/appointments" className={`menu-item ${isActive('/admin/appointments') ? 'active' : ''}`}>
              <FaCalendarCheck /> <span>Quản lý Lịch hẹn</span>
            </Link>
            <Link to="/admin/stock" className={`menu-item ${isActive('/admin/stock') ? 'active' : ''}`}>
              <FaBox /> <span>Quản lý Kho / Phụ tùng</span>
            </Link>
          </>
        )}

        {/* Staff */}
        {role === 'staff' && (
          <Link to="/staff" className={`menu-item ${isActive('/staff') ? 'active' : ''}`}>
            <FaCalendarCheck /> <span>Quản lý lịch hẹn</span>
          </Link>
        )}

        {/* Technician */}
        {role === 'technician' && (
          <>
            <Link to="/technician-task" className={`menu-item ${isActive('/technician-task') ? 'active' : ''}`}>
              <FaListCheck /> <span>Công việc được giao</span>
            </Link>
            <Link to="/checklist" className={`menu-item ${isActive('/checklist') ? 'active' : ''}`}>
              <FaClipboardCheck /> <span>Kiểm tra thực hiện</span>
            </Link>
            <Link to="/reports" className={`menu-item ${isActive('/reports') ? 'active' : ''}`}>
              <FaFileLines /> <span>Biên bản đã tạo</span>
            </Link>
            <Link to="/schedule" className={`menu-item ${isActive('/schedule') ? 'active' : ''}`}>
              <FaClock /> <span>Lịch làm việc</span>
            </Link>
          </>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          <FaRightFromBracket /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
