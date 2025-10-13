import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    // Xóa dữ liệu đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    // Chuyển về trang đăng nhập (hiện tại là "/")
    navigate("/");
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-left">
        <h2 className="logo">EV Car Center</h2>
      </div>

      {/* Menu */}
      <nav className="navbar-center">
        <Link to="/home">Trang Chủ</Link>
        <Link to="/appoint">Dịch Vụ</Link>
        <Link to="/about">Về Chúng Tôi</Link>
        <Link to="/contact">Liên Hệ</Link>
        <Link to="/report">Theo dõi</Link>
      </nav>

      {/* Nút đăng nhập / đăng xuất */}
      <div className="navbar-right">
        {isLoggedIn ? (
          <button className="btn logout" onClick={handleLogout}>
            Đăng Xuất
          </button>
        ) : (
          <Link to="/" className="btn login">
            Đăng Nhập
          </Link>
        )}
      </div>
    </header>
  );
}
