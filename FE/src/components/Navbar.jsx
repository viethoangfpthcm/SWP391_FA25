import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-left" onClick={() => navigate("/home")}>
        <img src={logo} alt="EV Car Center" className="logo-img" />
      </div>

      <nav className="navbar-center">
        <Link to="/home">Trang Chủ</Link>
        <Link to="/customer/dashboard">Bảng điều khiển</Link>
        <Link to="/appoint">Dịch Vụ</Link>
        <Link to="/about">Về Chúng Tôi</Link>
        <Link to="/contact">Liên Hệ</Link>
        <Link to="/report">Theo Dõi</Link>
      </nav>

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
