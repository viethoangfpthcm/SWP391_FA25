import Sidebar from "@components/layout/Sidebar.jsx";
import React, { useState, useEffect } from "react";
import { FaSpinner, FaSave, FaCheckCircle, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "@config/api.js";
import "./ProfilePage.css";
import Button from "@components/ui/Button.jsx";
import Loading from '@components/ui/Loading.jsx';

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
    

    // 1. Lấy thông tin profile khi tải trang
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
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

        // Validation phía client
        if (!/^[\p{L} ]+$/u.test(formData.fullName)) {
            showToast("Họ và tên chỉ được chứa chữ cái và khoảng trắng", "error");
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            showToast("Số điện thoại phải gồm đúng 10 chữ số", "error");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showToast("Email không hợp lệ", "error");
            return;
        }

        setIsUpdating(true);

        // Chuẩn bị dữ liệu gửi đi
        const updateData = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
        };

        // Chỉ gửi password nếu có
        if (formData.password && formData.password.trim() !== "") {
            updateData.password = formData.password;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            const contentType = res.headers.get("content-type");
            const data = contentType && contentType.includes("application/json")
                ? await res.json()
                : await res.text();

            if (!res.ok) {
                throw new Error(data.message || data || `Lỗi ${res.status}`);
            }

            // Cập nhật thành công
            localStorage.setItem("fullName", data.fullName);
            showToast("Cập nhật thông tin thành công!", "success");

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
                        <Button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
                            <FaTimes />
                        </Button>
                    </div>
                )}

                <h2 className="page-title">Tài khoản của tôi</h2>

                {loading ? (
                    <div className="loading-container">
                        <Loading inline /> Đang tải dữ liệu...
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
                                <Button
                                    type="submit"
                                    className="btn-save-profile"
                                    loading={isUpdating}
                                    disabled={isUpdating}
                                >
                                    {!isUpdating && <FaSave />}
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}