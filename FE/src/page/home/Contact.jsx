import React from "react";
import Footer from "../components/Footer";

import "../pagecss/Contact.css";
import Navbar from "../components/Navbar";

export default function Contact() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="contact-container">
          <h2 className="contact-title">Liên hệ</h2>
          <p><b>Địa chỉ:</b> 231 Nguyễn Văn Ngân, Thủ Đức, TP.HCM</p>
          <p><b>Hotline:</b> 0787 052 810</p>
          <p><b>Email:</b> EVCarCenter@gmail.com</p>
          <form className="contact-form">
            <div>
              <label>Họ và tên</label>
              <input type="text" placeholder="Nhập họ tên" />
            </div>
            <div>
              <label>Email</label>
              <input type="email" placeholder="Nhập email" />
            </div>
            <div>
              <label>Nội dung</label>
              <textarea placeholder="Nhập nội dung liên hệ" rows={3}></textarea>
            </div>
            <button type="submit" className="contact-submit-btn">
              Gửi liên hệ
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}