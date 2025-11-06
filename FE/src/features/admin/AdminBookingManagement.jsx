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
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import { API_BASE_URL } from "@config/api.js";

const BOOKING_STATUS_MAP = {
    PENDING: { text: 'Ch? x? lý', className: 'role-pending' },
    APPROVED: { text: 'Ðã duy?t', className: 'role-approved' },
    ASSIGNED: { text: 'Ðã gán th?', className: 'role-assigned' },
    IN_PROGRESS: { text: 'Ðang x? lý', className: 'role-in progress' },
    COMPLETED: { text: 'Hoàn thành', className: 'role-completed' },
    PAID: { text: 'Ðã thanh toán', className: 'role-paid' },
    CANCELLED: { text: 'Ðã h?y', className: 'role-cancelled' },
    DECLINED: { text: 'Ðã t? ch?i', className: 'role-declined' },
    PENDING_APPROVAL: { text: 'Ch? duy?t cu?i', className: 'role-pending' },
    DEFAULT: { text: 'Không rõ', className: 'role-default' }
};
const getStatusDisplay = (status) => {
    return BOOKING_STATUS_MAP[status] || { text: status || 'Không rõ', className: 'role-default' };
};

if (import.meta.env.MODE !== "development") {
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

    
    const token = localStorage.getItem("token");

    // Fetch current user info (Gi? nguyên)
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            if (!res.ok) throw new Error("Không th? t?i thông tin ngu?i dùng");
            const data = await res.json();
            localStorage.setItem("fullName", data.fullName || "Admin");
            localStorage.setItem("role", data.role || "Admin");
            setUserInfo({ fullName: data.fullName, role: data.role });
        } catch (err) {
            console.error(err);
            setError("Không th? t?i thông tin ngu?i dùng.");
        }
    };
    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Không th? t?i danh sách trung tâm");
            const data = await res.json();
            setCenters(data);
        } catch (e) {
            console.error(e);
        }
    };
    const handleViewChecklist = (bookingId) => {
        navigate(`/admin/checklist/booking/${bookingId}`);
    };
    const handleViewFeedback = async (bookingId) => {
        setShowFeedbackModal(true); // M? modal
        setFeedbackLoading(true);
        setSelectedFeedback(null);
        setFeedbackError(null);

        try {
            // G?i API ADMIN m?i
            const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 404) {
                // S?a l?i 404 t? backend
                const errorText = await res.text();
                throw new Error(errorText || "Không tìm th?y feedback cho l?ch h?n này.");
            }
            if (!res.ok) {
                throw new Error("L?i khi t?i feedback.");
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
                    ? `${API_BASE_URL}/api/admin/bookings`
                    : `${API_BASE_URL}/api/admin/bookings/by-center/${selectedCenter}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            if (!res.ok) throw new Error(`L?i t?i danh sách d?t l?ch (${res.status})`);
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Không th? t?i danh sách d?t l?ch.");
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
                (b) => b.status === filterStatus
            );
    // Helper d?nh d?ng ngày (M?i)
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

const statusOrder = [
    'pending',
    'approved',
    'assigned',
    'in_progress',
    'paid',
    'completed',
    'declined',
    'cancelled'
  ];

  const sortedAppointments = [...filteredBookings].sort((a, b) => {
    const statusA = a.status?.toLowerCase().trim() || '';
    const statusB = b.status?.toLowerCase().trim() || '';

    const rankA = statusOrder.indexOf(statusA);
    const rankB = statusOrder.indexOf(statusB);

    // DÒNG DEBUG: Dán dòng này vào d? xem chính xác nó dang so sánh gì vs '${statusB}' (rank ${rankB})`);

    const finalRankA = rankA === -1 ? Infinity : rankA;
    const finalRankB = rankB === -1 ? Infinity : rankB;

    if (finalRankA !== finalRankB) {
      return finalRankA - finalRankB;
    }

    return new Date(a.bookingDate) - new Date(b.bookingDate);
  });
    if (loading && !userInfo) { // C?p nh?t text loading
        return (
            <div className="dashboard-container admin-theme">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <Loading inline />
                    <p>Ðang t?i d? li?u d?t l?ch...</p>
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
                        <FaCalendarAlt /> Qu?n lý Ð?t l?ch
                    </h1>
                    <p>Xem và theo dõi t?t c? l?ch h?n trong h? th?ng.</p>
                </header>

                {error && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* B? l?c (Thay d?i) */}
                <div className="actions-bar">
                    <div className="filter-group admin-group">
                        <label htmlFor="statusFilter">
                            <FaFilter /> L?c tr?ng thái:
                        </label>
                        <select
                            id="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PAID">Paid</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="DECLINED">Declined</option>
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
                                T?t c? trung tâm
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
                                    <th>Ngày h?n</th>
                                    <th>K? thu?t viên</th>
                                    <th>Tr?ng thái (Booking)</th>
                                    <th>Tr?ng thái (Checklist)</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="empty-state">
                                            <Loading inline /> Ðang t?i...
                                        </td>
                                    </tr>
                                ) : sortedAppointments.length > 0 ? (
                                    sortedAppointments.map((booking) => (
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
                                            <td>{booking.technicianName || "Chua gán"}</td>
                                            <td>
                                                <span
                                                    className={`role-badge ${getStatusDisplay(booking.status).className}`}
                                                >
                                                    {getStatusDisplay(booking.status).text}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`role-badge ${getStatusDisplay(booking.checklistStatus).className}`}
                                                >
                                                    {getStatusDisplay(booking.checklistStatus).text || "Chua có"}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    className="action-button view-checklist"
                                                    onClick={() => handleViewChecklist(booking.bookingId)}
                                                    disabled={!booking.checklistStatus}
                                                    title={!booking.checklistStatus ? "Checklist chua du?c t?o" : "Xem chi ti?t checklist"}
                                                >
                                                    Xem Checklist
                                                </Button>
                                                <Button
                                                    className="action-button view-feedback"
                                                    onClick={() => handleViewFeedback(booking.bookingId)}
                                                    disabled={!booking.hasFeedback}
                                                    title={booking.hasFeedback ? "Xem feedback c?a khách hàng" : "Chua có feedback"}
                                                >
                                                    <FaCommentAlt /> Xem Feedback
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="empty-state">
                                            Không có d? li?u d?t l?ch.
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
                                <h2>Chi ti?t Feedback</h2>
                                <Button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="close-modal-btn"
                                >
                                    <FaTimes />
                                </Button>
                            </div>

                            <div className="modal-body" >
                                {feedbackLoading && (
                                    <div className="loading-state" style={{ padding: '40px' }}>
                                        <Loading inline /> Ðang t?i...
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
                                            <strong>Ðánh giá:</strong>
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
                                            <strong>Bình lu?n:</strong>
                                            <p className="comment-box">
                                                {selectedFeedback.comment || <em>(Không có bình lu?n)</em>}
                                            </p>
                                        </div>

                                        <p><strong>Tr?ng thái:</strong> {selectedFeedback.isPublished ? "Ðã duy?t" : "Chua duy?t"}</p>
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