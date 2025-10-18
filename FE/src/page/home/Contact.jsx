import React from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import "../home/Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <Navbar />
      <section className="contact-hero">
        <div className="contact-card">
          <h2>Liên hệ EV Car Center</h2>
          <p>Địa chỉ: 231 Nguyễn Văn Ngân, Thủ Đức, TP.HCM</p>
          <p>Hotline: 0787 052 810</p>
          <p>Email: EVCarCenter@gmail.com</p>
        </div>
        <div className="contact-card form-card">
          <h2>Gửi thông tin</h2>
          <form className="contact-form">
            <input type="text" placeholder="Họ và tên" required/>
            <input type="email" placeholder="Email" required/>
            <textarea placeholder="Nội dung" rows={5} required/>
            <button type="submit">Gửi</button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
