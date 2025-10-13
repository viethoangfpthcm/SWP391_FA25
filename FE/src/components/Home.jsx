import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="main-title">EV Service Center Maintenance Management System</h1>
        <p className="main-subtitle">Phần mềm quản lý bảo dưỡng xe điện cho trung tâm dịch vụ</p>
        
        <div className="hero-actions">
          <button className="btn-black" onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
          <button className="btn-white" onClick={() => navigate("/contact")}>
            Liên hệ
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3 className="feature-title">Quản lý xe điện</h3>
            <p className="feature-desc">Theo dõi thông tin xe, lịch sử bảo dưỡng và nhắc nhở định kỳ</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Đặt lịch dịch vụ</h3>
            <p className="feature-desc">Đặt lịch bảo dưỡng, sửa chữa một cách thuận tiện và nhanh chóng</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
              </svg>
            </div>
            <h3 className="feature-title">Quản lý phụ tùng</h3>
            <p className="feature-desc">Theo dõi tồn kho, quản lý nhập xuất phụ tùng chuyên dụng</p>
          </div>

          {/* Feature 4 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 className="feature-title">Báo cáo thống kê</h3>
            <p className="feature-desc">Phân tích doanh thu, hiệu suất và xu hướng hỏng hóc</p>
          </div>

          {/* Feature 5 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="feature-title">Quản lý nhân sự</h3>
            <p className="feature-desc">Quản lý ca làm, chứng chỉ và hiệu suất làm việc</p>
          </div>

          {/* Feature 6 */}
          <div className="feature-box">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h3 className="feature-title">Dịch vụ chuyên nghiệp</h3>
            <p className="feature-desc">Đội ngũ kỹ thuật viên có chứng chỉ EV chuyên nghiệp</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
        <section className="services-section">
        <h2 className="section-heading">Dịch vụ của chúng tôi</h2>
        
        <div className="services-grid">
          <div className="service-item">
            <h4 className="service-name">Bảo dưỡng định kỳ</h4>
            <p className="service-detail">Kiểm tra và bảo dưỡng theo lịch trình</p>
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
        <p className="cta-text">Đăng ký tài khoản để trải nghiệm dịch vụ quản lý bảo dưỡng xe điện hiện đại</p>
        <button className="btn-cta" onClick={() => navigate("/register")}>
          Đăng ký ngay
        </button>
      </section>
    </div>
  );
}