import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Đăng nhập không thành công.");

            const data = await response.json();

            // ✅ Lưu token và role vào localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            console.log("Login success", data);

            // Chuyển sang trang checklist/dashboard
            window.location.href = "/checklist";
        } catch (err) {
            setError(err.message);
        }
    };
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
                <form onSubmit={handleLogin} className="form">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="checkbox-wrapper">
                        <input type="checkbox" id="remember" />
                        <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                    </div>

                    <button type="submit" className="login-btn">ĐĂNG NHẬP</button>
                    {error && <div style={{ color: "red" }}>{error}</div>}
                </form>
            )}
        </div>
    );
};

export default LoginForm;