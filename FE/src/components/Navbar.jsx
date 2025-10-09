import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 className="logo">EV Car Center</h2>
      </div>

      <nav className="navbar-center">
        <Link to="/">Trang Chủ</Link>
        <Link to="/contact">Liên Hệ</Link>
        <Link to="/about">Về Chúng Tôi</Link>
        <Link to="/appoint">Dịch Vụ</Link>
      </nav>

      <div className="navbar-right">
        <button className="btn login">Đăng Nhập</button>
      </div>
    </header>
  );
}