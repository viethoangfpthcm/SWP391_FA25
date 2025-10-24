import React from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import "../home/AboutUs.css";

export default function About() {
  return (
    <div className="about-page">
      <Navbar />
      <section className="about-hero">
        <div className="about-hero-text">
          <h1>EV Car Center</h1>
          <p>
            Trung tâm dịch vụ xe điện hàng đầu Việt Nam, cung cấp giải pháp toàn diện từ tư vấn, bảo dưỡng đến chăm sóc khách hàng.
          </p>
        </div>
        <div className="about-hero-image">
          <img src="/images/ev-car-center.jpg" alt="EV Car Center" />
        </div>
      </section>

      <section className="about-features">
        <div className="feature-card">
          <h3>Chuyên nghiệp & Hiện đại</h3>
          <p>Đội ngũ kỹ thuật viên chuyên nghiệp, trang thiết bị hiện đại đảm bảo dịch vụ tối ưu.</p>
        </div>
        <div className="feature-card">
          <h3>Dịch vụ đa dạng</h3>
          <p>Từ bảo dưỡng định kỳ, kiểm tra kỹ thuật, đến sửa chữa chuyên sâu cho mọi loại xe điện.</p>
        </div>
        <div className="feature-card">
          <h3>Hỗ trợ khách hàng</h3>
          <p>Tư vấn và hỗ trợ trực tuyến 24/7, đồng hành cùng khách hàng mọi lúc mọi nơi.</p>
        </div>
        <div className="feature-card">
          <h3>Cam kết môi trường</h3>
          <p>Thực hiện quy trình thân thiện môi trường, giảm thiểu tác động carbon.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
  