import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <header className="navbar">
      {}
      <div className="navbar-left">
        <h2 className="logo">EV Car Center</h2>
      </div>

      {}
      <nav className="navbar-center">
        <Link to="/">Trang Chủ</Link>
        <Link to="/appoint">Dịch Vụ</Link>
        <Link to="/about">Về Chúng Tôi</Link>
        <Link to="/contact">Liên Hệ</Link>
      </nav>

      {}
      <div className="navbar-right">
        {isLoggedIn ? (
          <button className="btn logout" onClick={handleLogout}>
            Đăng Xuất
          </button>
        ) : (
          <Link to="/login" className="btn login">
            Đăng Nhập
          </Link>
        )}
      </div>
    </header>
  );
}
