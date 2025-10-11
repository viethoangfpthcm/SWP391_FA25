// import React, {useState} from "react";
// import {useNavigate} from "react-router-dom";
// import "./LoginForm.css";
//
// const LoginForm = () => {
//     const [activeTab, setActiveTab] = useState("login");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const navigate = useNavigate();
//
//     const redirectToDashboard = (role) => {
//         // Chuyển role về chữ in hoa để đảm bảo so sánh chính xác
//         const upperCaseRole = role.toUpperCase();
//
//         switch (upperCaseRole) {
//             case 'ADMIN':
//                 window.location.href = '/admin/dashboard'; // Đường dẫn cho Admin
//                 break;
//             case 'STAFF':
//                 window.location.href = '/staff/dashboard'; // Đường dẫn cho Staff
//                 break;
//             case 'TECHNICIAN':
//                 window.location.href = '/technician-task'; // Đường dẫn cho Technician
//                 break;
//             case 'CUSTOMER':
//                 window.location.href = '/checklist'; // Đường dẫn cho Customer
//                 break;
//             default:
//                 // Nếu không khớp với role nào, chuyển về trang chủ
//                 window.location.href = '/';
//                 break;
//         }
//     };
//
//     const handleLogin = async (e) => {
//         // e.preventDefault();
//         // setError("");
//         // try {
//         //     const response = await fetch("http://localhost:8080/api/users/login", {
//         //         method: "POST",
//         //         headers: {"Content-Type": "application/json"},
//         //         body: JSON.stringify({email, password}),
//         //     });
//         //
//         //     if (!response.ok) throw new Error("Đăng nhập không thành công.");
//         //
//         //     const data = await response.json();
//         //
//         //     // ✅ Lưu token và role vào localStorage
//         //     localStorage.setItem("token", data.token);
//         //     localStorage.setItem("role", data.role);
//         //
//         //     console.log("Login success", data);
//         //
//         //     // Chuyển sang trang checklist/dashboard
//         //     window.location.href = "/checklists";
//         // } catch (err) {
//         //     setError(err.message);
//         // }
//
//         e.preventDefault();
//         setError("");
//         try {
//             const response = await fetch("http://localhost:8080/api/users/login", {
//                 method: "POST",
//                 headers: {"Content-Type": "application/json"},
//                 body: JSON.stringify({email, password}),
//             });
//
//             if (!response.ok) {
//                 // Lấy thông báo lỗi từ body của response nếu có
//                 const errorData = await response.text();
//                 throw new Error(errorData || "Đăng nhập không thành công.");
//             }
//
//             const data = await response.json();
//
//
//             // Lưu token và role vào localStorage
//
//             localStorage.setItem("token", data.token);
//             localStorage.setItem("role", data.role);
//             localStorage.setItem("userId", data.userId); // Lưu userId nếu cần
//             console.log("Login success", data);
//
//             // ✅ Thay thế dòng code cũ bằng lệnh gọi hàm chuyển hướng mới
//             redirectToDashboard(data.role);
//
//         } catch (err) {
//             setError(err.message);
//         }
//
//     };
//     return (
//         <div className="login-wrapper">
//             <div className="tabs">
//                 <button
//                     className={`tab ${activeTab === "login" ? "active" : ""}`}
//                     onClick={() => setActiveTab("login")}
//                 >
//                     Đăng nhập
//                 </button>
//                 <button
//                     className={`tab ${activeTab === "register" ? "active" : ""}`}
//                     onClick={() => setActiveTab("register")}
//                 >
//                     Đăng ký
//                 </button>
//             </div>
//
//             {activeTab === "login" && (
//                 <form onSubmit={handleLogin} className="form">
//                     <label>Email</label>
//                     <input
//                         type="email"
//                         placeholder="Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//
//                     <label>Mật khẩu</label>
//                     <input
//                         type="password"
//                         placeholder="Mật khẩu"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//
//                     <div className="checkbox-wrapper">
//                         <input type="checkbox" id="remember"/>
//                         <label htmlFor="remember">Ghi nhớ đăng nhập</label>
//                     </div>
//
//                     <button type="submit" className="login-btn">ĐĂNG NHẬP</button>
//                     {error && <div style={{color: "red"}}>{error}</div>}
//                 </form>
//             )}
//         </div>
//     );
// };
//
// export default LoginForm;

import React, {useState} from "react";
import "./LoginForm.css"; // Đảm bảo bạn có file CSS này

const LoginForm = () => {
    // State chung
    const [activeTab, setActiveTab] = useState("login");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // State cho form Đăng nhập
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // State cho form Đăng ký
    const [registerData, setRegisterData] = useState({
        userId: "CU", // Giá trị cố định
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    // --- CÁC HÀM XỬ LÝ ---

    // Chuyển hướng sau khi đăng nhập thành công
    const redirectToDashboard = (role) => {
        const upperCaseRole = role.toUpperCase();
        switch (upperCaseRole) {
            case 'ADMIN':
                window.location.href = '/admin/dashboard';
                break;
            case 'STAFF':
                window.location.href = '/staff/dashboard';
                break;
            case 'TECHNICIAN':
                window.location.href = '/technicantask';
                break;
            case 'CUSTOMER':
                window.location.href = '/Home';
                break;
            default:
                window.location.href = '/';
                break;
        }
    };

    // Cập nhật state khi nhập liệu form đăng ký
    const handleRegisterChange = (e) => {
        const {name, value} = e.target;
        setRegisterData({
            ...registerData,
            [name]: value
        });
    };

    // Xử lý submit form Đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        try {
            const response = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: loginEmail, password: loginPassword}),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Đăng nhập không thành công.");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userId", data.userId);
            console.log("Login success", data);

            redirectToDashboard(data.role);

        } catch (err) {
            setError(err.message);
        }
    };

    // Xử lý submit form Đăng ký
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

        const dataToSubmit = {
            userId: registerData.userId,
            fullName: registerData.fullName,
            email: registerData.email,
            phone: registerData.phone,
            password: registerData.password,
            confirmPassword: registerData.confirmPassword
        };

        try {
            const response = await fetch("http://localhost:8080/api/users/register", { // URL API đăng ký
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Đăng ký không thành công.");
            }

            // Đăng ký thành công
            setSuccessMessage("Đăng ký thành công! Vui lòng chuyển qua tab đăng nhập.");
            // Reset form
            setRegisterData({
                userId: "CU",
                fullName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: ""
            });

        } catch (err) {
            setError(err.message);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError("");
        setSuccessMessage("");
    }

    // --- JSX RENDER ---
    return (
        <div className="login-wrapper">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === "login" ? "active" : ""}`}
                    onClick={() => switchTab("login")}
                >
                    Đăng nhập
                </button>
                <button
                    className={`tab ${activeTab === "register" ? "active" : ""}`}
                    onClick={() => switchTab("register")}
                >
                    Đăng ký
                </button>
            </div>

            {/* Form Đăng nhập */}
            {activeTab === "login" && (
                <form onSubmit={handleLogin} className="form">
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
                        <input type="checkbox" id="remember"/>
                        <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                    </div>

                    <button type="submit" className="login-btn">ĐĂNG NHẬP</button>
                </form>
            )}

            {/* Form Đăng ký */}
            {activeTab === "register" && (
                <form onSubmit={handleRegister} className="form">
                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Nguyễn Văn A"
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="example@email.com"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                    />

                    <label>Số điện thoại</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="09xxxxxxxx"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        required
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu (ít nhất 6 ký tự)"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                    />

                    <label>Xác nhận Mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                    />

                    <button type="submit" className="login-btn">ĐĂNG KÝ</button>
                </form>
            )}

            {/* Vùng hiển thị thông báo */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
    );
};

export default LoginForm;