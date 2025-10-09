// src/LoginForm.jsx
import React, { useState } from "react";
import  "./LoginForm.css";


const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("login"); // login | register

  return (
    <div className="login-wrapper">
      <div className="tabs">
       <button
  className={`tab ${activeTab === "login" ? "active" : ""}`}
  onClick={() => setActiveTab("login")}
>
  Đăng nhập
</button>

        <button
          className={`tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Đăng ký
        </button>
      </div>

      
      {activeTab === "login" && (
        <div className="form">
          <label>Email</label>
          <input type="email" placeholder="Email" />

          <label>Mật khẩu</label>
          <input type="password" placeholder="Mật khẩu" />

          <div className="checkbox-wrapper">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>

          <button className="login-btn">ĐĂNG NHẬP</button>
        </div>
      )}

      {/* Form đăng ký */}
      {activeTab === "register" && (
        <div className="form">
          <label>Họ và tên</label>
          <input type="text" placeholder="Họ và tên" />

          <label>Email</label>
          <input type="email" placeholder="Email" />

          <label>Mật khẩu</label>
          <input type="password" placeholder="Mật khẩu" />

          <label>Xác nhận mật khẩu</label>
          <input type="password" placeholder="Nhập lại mật khẩu" />

          <button className="login-btn">ĐĂNG KÝ</button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
