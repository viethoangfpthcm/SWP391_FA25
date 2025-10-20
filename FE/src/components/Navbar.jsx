import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Navbar.css";


export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
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
    navigate("/login");
  };

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-left" onClick={() => navigate("/home")}>
        <img src={logo} alt="EV Car Center" className="logo-img" />
      </div>

      <nav className="navbar-center">
        {/* Trang chủ luôn hiển thị */}
        <Link to="/home">Trang Chủ</Link>

        {/* Các trang public khi chưa đăng nhập */}
        {!isLoggedIn && (
          <>
            <Link to="/about">Về Chúng Tôi</Link>
            <Link to="/contact">Liên Hệ</Link>
          </>
        )}

        {/* Các trang riêng khi đã đăng nhập */}
        {isLoggedIn && (
          <>
            <Link to="/customer/dashboard">Bảng điều khiển</Link>
            <Link to="/appoint">Dịch Vụ</Link>
            <Link to="/about">Về Chúng Tôi</Link>
            <Link to="/contact">Liên Hệ</Link>
            <Link to="/report">Biên Bản</Link>
          </>
        )}
      </nav>

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
