import React from "react";

import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import "../home/AboutUs.css";

export default function About() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <section className="about">
          <h1>Về Chúng Tôi</h1>
          <p>
            EV Car Center là trung tâm dịch vụ và tư vấn xe điện hàng đầu, cam kết mang đến cho khách hàng những giải pháp tối ưu về xe điện, bảo trì và chăm sóc khách hàng tận tâm.
          </p>
          <ul>
            <li>Đội ngũ kỹ thuật viên chuyên nghiệp</li>
            <li>Dịch vụ đa dạng và hiện đại</li>
            <li>Hỗ trợ khách hàng 24/7</li>
          </ul>
          <p>
            Chúng tôi luôn nỗ lực để trở thành người bạn đồng hành tin cậy của bạn trên mọi hành trình.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}