import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3 className="footer-logo">EV Car Center</h3>
          <p>231 Nguyễn Văn Ngân</p>
           <p>Thủ Đức, Hồ Chí Minh</p>
            <p>HotLine : 0787052810 </p> 
            <p>Gmail: EVCarCenter@gmail.com</p>
           
            
          <p>© {new Date().getFullYear()} EV Car Center. All rights reserved.</p>
        </div>

        <div className="footer-center">
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="#">Bảo dưỡng xe  </a></li>
            <li><a href="#">Đặt lịch bảo dưỡng </a></li>
            <li><a href="#">Các trung tâm gần nhất</a></li>
          </ul>
        </div>

        <div className="footer-right">
          <h4>Kết nối</h4>
          <div className="social">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
