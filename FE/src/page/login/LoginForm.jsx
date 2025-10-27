import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Tab mặc định (login hoặc register từ Home) ---
  const defaultTab = location.state?.defaultTab || "login";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // --- State chung ---
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  
  const API_BASE_URL = "https://103.90.226.216:8443/api/users";


  useEffect(() => {
    if (location.state?.defaultTab) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // --- Chuyển hướng sau đăng nhập theo role ---
  const redirectToDashboard = (role) => {
    const upperCaseRole = role?.toUpperCase() || "";

    switch (upperCaseRole) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "STAFF":
        navigate("/staff");
        break;
      case "TECHNICIAN":
        navigate("/technicantask");
        break;
      case "CUSTOMER":
        navigate("/home");
        break;
      default:
        navigate("/");
        break;
    }
  };

  // --- Đăng nhập ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Đăng nhập không thành công.");
      }

      const data = await response.json();

      // Lưu token & role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      console.log("Login success:", data);

      // Điều hướng theo role
      redirectToDashboard(data.role);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Đăng ký ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (registerData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    const dataToSubmit = { ...registerData };

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Đăng ký không thành công.");
      }

      setSuccessMessage("Đăng ký thành công! Vui lòng chuyển qua tab đăng nhập.");
      setRegisterData({
        userId: "CU",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const responseText = await response.text(); 

      if (!response.ok) {
        throw new Error(responseText || "Gửi yêu cầu không thành công.");
      }

      setSuccessMessage(responseText);
      setForgotEmail(""); 

    } catch (err) {
      setError(err.message);
    }
  };


  // --- Chuyển tab ---
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
  };

  return (
  <div className="login-page">
    <div className="login-container">
      {/* === Tabs trên đầu Email === */}
      <div className="tabs-top">
        <button
          className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
          onClick={() => switchTab("login")}
        >
          Đăng nhập
        </button>
        <button
          className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
          onClick={() => switchTab("register")}
        >
          Đăng ký
        </button>
      </div>

      {/* === Form hiển thị tương ứng === */}
      {activeTab === "login" && (
        <form onSubmit={handleLogin} className="form-box">
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />

          <div className="checkbox-wrapper">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>

          <a
            href="#"
            className="forgot-link"
            onClick={(e) => {
              e.preventDefault();
              switchTab("forgot");
            }}
          >
            Quên mật khẩu?
          </a>

          <button type="submit" className="login-btn">
            ĐĂNG NHẬP
          </button>
        </form>
      )}

      {activeTab === "register" && (
        <form onSubmit={handleRegister} className="form-box">
          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={registerData.fullName}
            onChange={(e) =>
              setRegisterData({ ...registerData, fullName: e.target.value })
            }
            required
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            required
          />
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            placeholder="09xxxxxxxx"
            value={registerData.phone}
            onChange={(e) =>
              setRegisterData({ ...registerData, phone: e.target.value })
            }
            required
          />
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
            required
          />
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
            required
          />

          <button type="submit" className="login-btn">
            ĐĂNG KÝ
          </button>
        </form>
      )}

      {activeTab === "forgot" && (
        <form onSubmit={handleForgotPassword} className="form-box">
          <h3 className="reset-title">Quên Mật Khẩu</h3>
          <p style={{ textAlign: "center", fontSize: "14px", color: "#ccc" }}>
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
          </p>

          <label>Email</label>
          <input
            type="email"
            placeholder="Email đã đăng ký"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            GỬI LIÊN KẾT
          </button>

          <a
            href="#"
            className="back-link"
            onClick={(e) => {
              e.preventDefault();
              switchTab("login");
            }}
          >
            Quay lại đăng nhập
          </a>
        </form>
      )}

      {error && <div className="error-msg">{error}</div>}
      {successMessage && <div className="success-msg">{successMessage}</div>}
    </div>
  </div>
);

};

export default LoginForm;