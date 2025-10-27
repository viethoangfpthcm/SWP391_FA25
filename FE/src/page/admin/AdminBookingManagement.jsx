import React, { useState, useEffect } from "react";
import {
    FaCalendarAlt,
    FaSpinner,
    FaFilter,
    FaExclamationTriangle,
    FaCommentAlt,
    FaTimes,
    FaStar,
} from "react-icons/fa";
import "./AdminBookingManagement.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

if (import.meta.env.MODE !== "development") {
    console.log = () => { };
}

export default function AdminBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
    const token = localStorage.getItem("token");

    // Fetch current user info (Giữ nguyên)
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
            const data = await res.json();
            localStorage.setItem("fullName", data.fullName || "Admin");
            localStorage.setItem("role", data.role || "Admin");
            setUserInfo({ fullName: data.fullName, role: data.role });
        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin người dùng.");
        }
    };
    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Không thể tải danh sách trung tâm");
            const data = await res.json();
            console.log("Centers data:", data);
            setCenters(data);
        } catch (e) {
            console.error(e);
        }
    };
    const handleViewChecklist = (bookingId) => {
        navigate(`/admin/checklist/booking/${bookingId}`);
    };
    const handleViewFeedback = async (bookingId) => {
        setShowFeedbackModal(true); // Mở modal
        setFeedbackLoading(true);
        setSelectedFeedback(null);
        setFeedbackError(null);

        try {
            // Gọi API ADMIN mới
            const res = await fetch(`${API_BASE}/api/admin/feedback/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 404) {
                // Sửa lỗi 404 từ backend
                const errorText = await res.text();
                throw new Error(errorText || "Không tìm thấy feedback cho lịch hẹn này.");
            }
            if (!res.ok) {
                throw new Error("Lỗi khi tải feedback.");
            }

            const data = await res.json();
            setSelectedFeedback(data);

        } catch (err) {
            setFeedbackError(err.message);
        } finally {
            setFeedbackLoading(false);
        }
    };

    // Fetch danh sách booking 
    const fetchBookings = async () => {
        try {
            setError(null);
            setLoading(true);
            const url =
                selectedCenter === "all"
                    ? `${API_BASE}/api/admin/bookings`
                    : `${API_BASE}/api/admin/bookings/by-center/${selectedCenter}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            if (!res.ok) throw new Error(`Lỗi tải danh sách đặt lịch (${res.status})`);
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách đặt lịch.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchUserInfo();
        fetchCenters();
    }, [token, navigate]);

    useEffect(() => {
        fetchBookings();
    }, [selectedCenter]);


    const filteredBookings =
        filterStatus === "all"
            ? bookings
            : bookings.filter(
                (b) => b.status && b.status.toLowerCase() === filterStatus.toLowerCase()
            );

    // Helper định dạng ngày (Mới)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const options = {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit",
            };
            return new Date(dateString).toLocaleString("vi-VN", options);
        } catch (error) {
            return dateString;
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "role-cancelled"; // Mặc định
        return `role-${status.toLowerCase()}`;
    };


    if (loading && !userInfo) { // Cập nhật text loading
        return (
            <div className="dashboard-container admin-theme">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <FaSpinner className="spinner" />
                    <p>Đang tải dữ liệu đặt lịch...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container admin-theme">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />

            <main className="main-content">
                <header className="page-header">
                    <h1>
                        <FaCalendarAlt /> Quản lý Đặt lịch
                    </h1>
                    <p>Xem và theo dõi tất cả lịch hẹn trong hệ thống.</p>
                </header>

                {error && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* Bộ lọc (Thay đổi) */}
                <div className="actions-bar">
                    <div className="filter-group admin-group">
                        <label htmlFor="statusFilter">
                            <FaFilter /> Lọc trạng thái:
                        </label>
                        <select
                            id="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Declined">Declined</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="centerFilter">
                            <FaFilter /> Trung tâm:
                        </label>
                        <select
                            id="centerFilter"
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                        >
                            <option key="all" value="all">
                                Tất cả trung tâm
                            </option>
                            {centers.map((center) => (
                                <option key={center.id} value={center.id}>
                                    {center.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>



                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Xe</th>
                                    <th>Trung tâm</th>
                                    <th>Ngày hẹn</th>
                                    <th>Kỹ thuật viên</th>
                                    <th>Trạng thái (Booking)</th>
                                    <th>Trạng thái (Checklist)</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="empty-state">
                                            <FaSpinner className="spinner" /> Đang tải...
                                        </td>
                                    </tr>
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.bookingId}>
                                            <td>#{booking.bookingId}</td>
                                            <td>
                                                {booking.customerName}
                                                <br />
                                                <small>{booking.customerPhone}</small>
                                            </td>
                                            <td>
                                                {booking.vehiclePlate}
                                                <br />
                                                <small>{booking.vehicleModel}</small>
                                            </td>
                                            <td>{booking.centerName || "N/A"}</td>
                                            <td>{formatDate(booking.bookingDate)}</td>
                                            <td>{booking.technicianName || "Chưa gán"}</td>
                                            <td>
                                                <span
                                                    className={`role-badge ${getStatusClass(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`role-badge ${getStatusClass(
                                                        booking.checklistStatus
                                                    )}`}
                                                >
                                                    {booking.checklistStatus || "Chưa có"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-button view-checklist"
                                                    onClick={() => handleViewChecklist(booking.bookingId)}
                                                    disabled={!booking.checklistStatus}
                                                    title={!booking.checklistStatus ? "Checklist chưa được tạo" : "Xem chi tiết checklist"}
                                                >
                                                    Xem Checklist
                                                </button>
                                                <button
                                                    className="action-button view-feedback"
                                                    onClick={() => handleViewFeedback(booking.bookingId)}                                              
                                                    disabled={!booking.hasFeedback}
                                                    title={booking.hasFeedback ? "Xem feedback của khách hàng" : "Chưa có feedback"}
                                                >
                                                    <FaCommentAlt /> Xem Feedback
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="empty-state">
                                            Không có dữ liệu đặt lịch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {showFeedbackModal && (
                    <div className="modal-overlay" >
                        <div className="modal-content admin-modal feedback-modal">
                            <div className="modal-header">
                                <h2>Chi tiết Feedback</h2>
                                <button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="close-modal-btn"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body" >
                                {feedbackLoading && (
                                    <div className="loading-state" style={{ padding: '40px' }}>
                                        <FaSpinner className="spinner" /> Đang tải...
                                    </div>
                                )}

                                {feedbackError && (
                                    <div className="error-message general-error" style={{ textAlign: 'center', margin: '20px' }}>
                                        <FaExclamationTriangle /> {feedbackError}
                                    </div>
                                )}

                                {selectedFeedback && (
                                    <div className="feedback-details">
                                        <p><strong>Khách hàng:</strong> {selectedFeedback.userName}</p>
                                        <p><strong>Xe:</strong> {selectedFeedback.licensePlate}</p>
                                        <p><strong>Trung tâm:</strong> {selectedFeedback.centerName}</p>
                                        <p><strong>Ngày:</strong> {formatDate(selectedFeedback.feedbackDate)}</p>

                                        <div className="feedback-rating">
                                            <strong>Đánh giá:</strong>
                                            <div className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < selectedFeedback.rating ? "star-filled" : "star-empty"}
                                                    />
                                                ))}
                                                <span className="rating-number">({selectedFeedback.rating}/5)</span>
                                            </div>
                                        </div>

                                        <div className="feedback-comment">
                                            <strong>Bình luận:</strong>
                                            <p className="comment-box">
                                                {selectedFeedback.comment || <em>(Không có bình luận)</em>}
                                            </p>
                                        </div>

                                        <p><strong>Trạng thái:</strong> {selectedFeedback.isPublished ? "Đã duyệt" : "Chưa duyệt"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}