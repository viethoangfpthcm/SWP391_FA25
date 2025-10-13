import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-column">
        <h3>EV Car Center</h3>
        <p>231 Nguyễn Văn Ngân, Thủ Đức, TP.HCM</p>
        <p>Hotline: 0787052810</p>
        <p>Email: EVCarCenter@gmail.com</p>
      </div>

      <div className="footer-column">
        <h3>Sản phẩm</h3>
        <p><a href="#">Bảo dưỡng xe</a></p>
        <p><a href="#">Đặt lịch bảo dưỡng</a></p>
        <p><a href="#">Trung tâm gần nhất</a></p>
      </div>

      <div className="footer-column">
        <h3>Kết nối</h3>
        <p><a href="#">Facebook</a></p>
        <p><a href="#">Instagram</a></p>
        <p><a href="#">Twitter</a></p>
      </div>

      <div className="footer-bottom">
        © 2025 EV Car Center. All rights reserved.
      </div>
    </footer>
  );
}
