import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-column">
          <h3 className="footer-title">EV Car Center</h3>
          <p>231 Nguyễn Văn Ngân, Thủ Đức, TP.HCM</p>
          <p>Hotline: <strong>0787 052 810</strong></p>
          <p>Email: <a href="mailto:EVCarCenter@gmail.com">EVCarCenter@gmail.com</a></p>
        </div>

        <div className="footer-column">
          <h4>Dịch vụ</h4>
          <ul>
            <li><a >Bảo dưỡng xe</a></li>
            <li><a >Đặt lịch bảo dưỡng</a></li>
            <li><a >Trung tâm gần nhất</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Về chúng tôi</h4>
          <ul>
            <li><a >Giới thiệu</a></li>
            <li><a >Tin tức & Khuyến mãi</a></li>
            <li><a >Liên hệ</a></li>
          </ul>
        </div>

          <div className="footer-column">
            <h4>Kết nối với chúng tôi</h4>
            <div className="footer-socials">
              <a href="https://www.facebook.com/akk.7105?locale=vi_VN"><FaFacebookF /></a>
              <a href="https://www.instagram.com/quthang_d12/"><FaInstagram /></a>
              <a href="https://www.youtube.com/watch?v=QK5tzqdukW8&list=RDQK5tzqdukW8&start_radio=1"><FaYoutube /></a>
            </div>
          </div>
        </div>

      <div className="footer-bottom">
        © 2025 <strong>EV Car Center</strong>. All rights reserved.
      </div>
    </footer>
  );
}
