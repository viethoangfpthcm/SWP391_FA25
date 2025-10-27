import Sidebar from "../../page/sidebar/sidebar.jsx";
import React, { useState, useEffect } from "react";
import { FaSpinner, FaSave, FaCheckCircle, FaTimes } from "react-icons/fa";
import "../../page/ProfilePage/ProfilePage.css";

export default function ProfilePage({ user }) {
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "", // Email sẽ không cho sửa
        phone: "",
        password: "", // Mật khẩu mới (để trống nếu không đổi)
    });

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const token = localStorage.getItem("token");

    // Hàm hiển thị toast
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 4000);
    };
    const API_BASE = "https://103.90.226.216:8443";

    // 1. Lấy thông tin profile khi tải trang
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Không thể tải thông tin tài khoản");
                }

                const data = await res.json();

                setFormData({
                    fullName: data.fullName || "",
                    email: data.email || "", // Email không cho sửa
                    phone: data.phone || "",
                    password: "", // Luôn reset ô password
                });

            } catch (error) {
                showToast(`Lỗi: ${error.message}`, "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    // 2. Xử lý khi gõ vào form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 3. Xử lý khi nhấn nút "Lưu"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        // Chuẩn bị dữ liệu gửi đi
        const updateData = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email, // Gửi email hiện tại để backend so sánh
        };

        // Chỉ gửi password nếu người dùng nhập vào (không gửi chuỗi rỗng)
        if (formData.password && formData.password.trim() !== "") {
            updateData.password = formData.password;
        }

        try {
            const res = await fetch(`${API_BASE}/api/users/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Lỗi ${res.status}`);
            }

            const updatedUser = await res.json(); // DTO trả về

            // Cập nhật lại tên trên localStorage
            localStorage.setItem("fullName", updatedUser.fullName);

            showToast("Cập nhật thông tin thành công!", "success");

            // Xóa ô mật khẩu sau khi thành công
            setFormData(prev => ({ ...prev, password: "" }));

        } catch (error) {
            showToast(`Cập nhật thất bại: ${error.message}`, "error");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="profile-page">
            <Sidebar user={user} />

            <div className="content">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === "success" && <FaCheckCircle />}
                            {toast.type === "error" && <FaTimes />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
                            <FaTimes />
                        </button>
                    </div>
                )}

                <h2 className="page-title">Tài khoản của tôi</h2>

                {loading ? (
                    <div className="loading-container">
                        <FaSpinner className="spinner-icon" /> Đang tải dữ liệu...
                    </div>
                ) : (
                    <div className="profile-form-container">
                        <form onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label htmlFor="fullName">Họ và tên</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}  
                                    className="form-input"          
                                    required                        
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <hr className="form-divider" />

                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Để trống nếu không muốn thay đổi"
                                />
                                <small>Nhập mật khẩu mới nếu bạn muốn thay đổi.</small>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn-save-profile"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <FaSpinner className="spin" />
                                    ) : (
                                        <FaSave />
                                    )}
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}