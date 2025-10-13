import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleMainButton = () => {
    if (token) {
      navigate("/payment/ready"); // Khi có token thì chuyển sang trang payment
    } else {
      navigate("/login"); // Khi chưa đăng nhập thì sang trang login
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="main-title">
          EV Service Center Maintenance Management System
        </h1>
        <p className="main-subtitle">
          Phần mềm quản lý bảo dưỡng xe điện cho trung tâm dịch vụ
        </p>

        <div className="hero-actions">
          <button className="btn-black" onClick={handleMainButton}>
            {token ? "GET" : "Đăng nhập"}
          </button>
          <button className="btn-white" onClick={() => navigate("/contact")}>
            Liên hệ
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          {/* 6 ô ở giữa */}
          <div className="feature-box">
            <h3 className="feature-title">Quản lý xe điện</h3>
            <p className="feature-desc">
              Theo dõi thông tin xe, lịch sử bảo dưỡng và nhắc nhở định kỳ
            </p>
          </div>

          <div className="feature-box">
            <h3 className="feature-title">Đặt lịch dịch vụ</h3>
            <p className="feature-desc">
              Đặt lịch bảo dưỡng, sửa chữa một cách thuận tiện và nhanh chóng
            </p>
          </div>

          <div className="feature-box">
            <h3 className="feature-title">Quản lý phụ tùng</h3>
            <p className="feature-desc">
              Theo dõi tồn kho, quản lý nhập xuất phụ tùng chuyên dụng
            </p>
          </div>

          <div className="feature-box">
            <h3 className="feature-title">Báo cáo thống kê</h3>
            <p className="feature-desc">
              Phân tích doanh thu, hiệu suất và xu hướng hỏng hóc
            </p>
          </div>

          <div className="feature-box">
            <h3 className="feature-title">Quản lý nhân sự</h3>
            <p className="feature-desc">
              Quản lý ca làm, chứng chỉ và hiệu suất làm việc
            </p>
          </div>

          <div className="feature-box">
            <h3 className="feature-title">Dịch vụ chuyên nghiệp</h3>
            <p className="feature-desc">
              Đội ngũ kỹ thuật viên có chứng chỉ EV chuyên nghiệp
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2 className="section-heading">Dịch vụ của chúng tôi</h2>

        <div className="services-grid">
          <div className="service-item">
            <h4 className="service-name">Bảo dưỡng định kỳ</h4>
            <p className="service-detail">
              Kiểm tra và bảo dưỡng theo lịch trình
            </p>
          </div>

          <div className="service-item">
            <h4 className="service-name">Sửa chữa phanh</h4>
            <p className="service-detail">Bảo trì hệ thống phanh tái sinh</p>
          </div>

          <div className="service-item">
            <h4 className="service-name">Thay thế ắc quy</h4>
            <p className="service-detail">Kiểm tra và thay pin EV</p>
          </div>

          <div className="service-item">
            <h4 className="service-name">Chẩn đoán điện tử</h4>
            <p className="service-detail">Kiểm tra hệ thống điện tử</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-heading">Bắt đầu sử dụng ngay hôm nay</h2>
        <p className="cta-text">
          Đăng ký tài khoản để trải nghiệm dịch vụ quản lý bảo dưỡng xe điện
          hiện đại
        </p>
        <button className="btn-cta" onClick={() => navigate("/register")}>
          Đăng ký ngay
        </button>
      </section>
    </div>
  );
}
