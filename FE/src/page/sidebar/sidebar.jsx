import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    FaHouse,
    FaCalendarCheck,
    FaListCheck,
    FaClipboardCheck,
    FaFileLines,
    FaClock,
    FaRightFromBracket,
} from "react-icons/fa6";
import "./sidebar.css";

const Sidebar = ({sidebarOpen}) => {
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
                    <FaHouse/> Trang chủ
                </Link>
                <Link to="/staff" className="menu-item">
                    <FaCalendarCheck/> Quản lý lịch hẹn
                </Link>
                <Link to="/technician-task" className="menu-item">
                    <FaListCheck/> Công việc được giao
                </Link>
                <Link to="/checklist" className="menu-item">
                    <FaClipboardCheck/> Kiểm tra thực hiện
                </Link>
                <Link to="/reports" className="menu-item">
                    <FaFileLines/> Biên bản đã tạo
                </Link>
                <Link to="/schedule" className="menu-item">
                    <FaClock/> Lịch làm việc
                </Link>

                {/* Logout button directly below menu */}
                <button className="logout-btn" onClick={handleLogout}>
                    <FaRightFromBracket/> Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
