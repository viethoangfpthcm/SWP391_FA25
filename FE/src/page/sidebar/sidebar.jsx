import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaTasks,
  FaClipboardCheck,
  FaFileAlt,
  FaClock,
  FaSignOutAlt,
} from "react-icons/fa";
import "./sidebar.css";

const Sidebar = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
    

      {/* Technician info */}
      <div className="technician-info">
        <h3>Phạm Văn C</h3>
        <p>Kỹ thuật viên</p>
      </div>

      {/* Main menu */}
      <div className="menu">
        <Link to="/home" className="menu-item">
          <FaHome /> Trang chủ
        </Link>
        <Link to="/appointments" className="menu-item">
          <FaCalendarCheck /> Quản lý lịch hẹn
        </Link>
        <Link to="/technician-task" className="menu-item">
          <FaTasks /> Công việc được giao
        </Link>
        <Link to="/checklist" className="menu-item">
          <FaClipboardCheck /> Kiểm tra thực hiện
        </Link>
        <Link to="/reports" className="menu-item">
          <FaFileAlt /> Biên bản đã tạo
        </Link>
        <Link to="/schedule" className="menu-item">
          <FaClock /> Lịch làm việc
        </Link>

        {/* Logout button directly below menu */}
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
