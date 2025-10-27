import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultTab = location.state?.defaultTab || "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    userId: "CU",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.state?.defaultTab) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch("https://103.90.226.216:8443/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) throw new Error(await response.text() || "Đăng nhập không thành công.");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      redirectToDashboard(data.role);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (registerData.password !== registerData.confirmPassword)
      return setError("Mật khẩu xác nhận không khớp!");
    if (registerData.password.length < 6)
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");

    try {
      const response = await fetch("https://103.90.226.216:8443/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) throw new Error(await response.text() || "Đăng ký không thành công.");

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

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="login-container">
      {/* Left section with welcome text */}
      <div className="left-panel">
        <h1 className="welcome-title">WELCOME!</h1>
      </div>

      {/* Right section with login/register */}
      <div className="right-panel">
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="form-box"
            >
              <h2>Đăng nhập</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn">ĐĂNG NHẬP</button>
              </form>

              <div className="social-icons">
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaTwitter /></a>
              </div>

              <p className="switch-text">
                Chưa có tài khoản?{" "}
                <span onClick={() => switchTab("register")}>Đăng ký</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="form-box"
            >
              <h2>Đăng ký</h2>
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, fullName: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <button type="submit" className="btn">ĐĂNG KÝ</button>
              </form>

              <p className="switch-text">
                Đã có tài khoản?{" "}
                <span onClick={() => switchTab("login")}>Đăng nhập</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
};

export default LoginForm;
