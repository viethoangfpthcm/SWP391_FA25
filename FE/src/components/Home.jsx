import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaBolt, FaShieldAlt, FaUsers, FaChartLine, FaTools } from "react-icons/fa";
import "./Home.css";
import logo from "../assets/logo.jpg"; // Logo giống Navbar

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleMainButton = () => {
    if (token) navigate("/payment/ready");
    else navigate("/login");
  };

  return (
    <div className="homepage">

      {/* ===== Hero Section ===== */}
      <section className="hero-section full-screen">
        <div className="hero-bg-shape"></div>
        <img src={logo} alt="EV Car Center" className="hero-logo" />
        <h1 className="main-title">EV Car Center</h1>
        <p className="main-subtitle">Hệ thống bảo dưỡng xe điện tiên tiến, hiện đại, đáng tin cậy</p>
        <p className="main-subtitle">Tiên phong cho giao thông xanh và bền vững</p>
        <p className="main-subtitle">Trải nghiệm dịch vụ EV thông minh, nhanh chóng, an toàn</p>
        <div className="hero-actions">
          <button className="btn-black" onClick={handleMainButton}>
            {token ? "Bắt đầu trải nghiệm" : "Đăng nhập"}
          </button>
          <button className="btn-white" onClick={() => navigate("/contact")}>
            Liên hệ
          </button>
        </div>
      </section>

      {/* ===== Mission Section ===== */}
      <section className="mission-section full-screen">
        <h2 className="section-heading">Sứ mệnh & Giá trị EV Car Center</h2>
        <div className="mission-grid">
          <div className="mission-box">
            <FaLeaf className="mission-icon" />
            <h3 className="mission-title">Bền vững</h3>
            <p className="mission-desc">Góp phần vào tương lai giao thông xanh, giảm khí thải, bảo vệ môi trường.</p>
          </div>
          <div className="mission-box">
            <FaBolt className="mission-icon" />
            <h3 className="mission-title">Hiệu năng</h3>
            <p className="mission-desc">Công nghệ tiên tiến, bảo dưỡng nhanh chóng, tiết kiệm thời gian cho khách hàng.</p>
          </div>
          <div className="mission-box">
            <FaShieldAlt className="mission-icon" />
            <h3 className="mission-title">An toàn</h3>
            <p className="mission-desc">Chất lượng dịch vụ cao, bảo vệ xe và khách hàng tối đa.</p>
          </div>
          <div className="mission-box">
            <FaUsers className="mission-icon" />
            <h3 className="mission-title">Chuyên nghiệp</h3>
            <p className="mission-desc">Đội ngũ kỹ thuật viên có chứng chỉ chuyên môn EV, tận tâm phục vụ.</p>
          </div>
          <div className="mission-box">
            <FaChartLine className="mission-icon" />
            <h3 className="mission-title">Đổi mới</h3>
            <p className="mission-desc">Liên tục cập nhật xu hướng công nghệ mới, nâng cấp dịch vụ.</p>
          </div>
          <div className="mission-box">
            <FaTools className="mission-icon" />
            <h3 className="mission-title">Đáng tin cậy</h3>
            <p className="mission-desc">Dịch vụ minh bạch, thông tin rõ ràng, khách hàng luôn yên tâm.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta-section full-screen">
        <div className="cta-bg-shape"></div>
        <h2 className="cta-heading">Trải nghiệm EV Car Center ngay hôm nay</h2>
        <p className="cta-text">Tận hưởng dịch vụ xe điện thông minh, hiện đại và tiện lợi</p>
        <p className="cta-text">Bảo vệ môi trường, tiết kiệm năng lượng và trải nghiệm công nghệ cao</p>
        <p className="cta-text">Đăng ký ngay để trở thành một phần của cuộc cách mạng EV</p>
        <button className="btn-cta" onClick={() => navigate("/")}>
          Đăng ký ngay
        </button>
      </section>

    </div>
  );
}
