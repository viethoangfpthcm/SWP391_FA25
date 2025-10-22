import React, { useState, useEffect } from "react";
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaFilter,
    FaSpinner,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaUserCheck, 
    FaCar,    
    FaBook,  
} from "react-icons/fa";
import "../staff/StaffDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

// Tắt console.log ở production
if (import.meta.env.MODE !== "development") {
    console.log = () => { };
}

// Đổi tên component
export default function AdminBookingManagement() {
    const [appointments, setAppointments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnicians, setSelectedTechnicians] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); 
    const [statusFilter, setStatusFilter] = useState("pending");
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
    const token = localStorage.getItem("token");

    // --- HÀM FETCH USER INFO (Giữ nguyên) ---
    const fetchUserInfo = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            navigate("/");
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!response.ok) {
                console.error("Failed to fetch user info:", response.status);
                if (response.status === 401) {
                    localStorage.clear(); // Xóa hết khi lỗi 401
                    navigate("/");
                }
                throw new Error("Không thể tải thông tin người dùng.");
            }
            const data = await response.json();
            const fetchedFullName = data.fullName || data.name || "N/A";
            const fetchedRole = data.role || "N/A";
            localStorage.setItem('fullName', fetchedFullName);
            localStorage.setItem('role', fetchedRole);
            setUserInfo({ fullName: fetchedFullName, role: fetchedRole });
            setError(null);
        } catch (err) {
            console.error("Error fetching user info:", err);
            setError(`Lỗi tải thông tin người dùng: ${err.message}`);
        }
    };

    const fetchAppointments = async () => {
        try {
            console.log("📅 [Admin] Fetching pending appointments...");
            setError(null);

            const response = await fetch(`${API_BASE}/api/admin/bookings/pending`, { // Dùng API pending của Admin
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("[Admin] Appointments API failed:", response.status, errorText);
                if (response.status === 401) {
                    setError("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
                    setTimeout(() => { localStorage.clear(); navigate("/"); }, 2000);
                } else {
                    setError(`Không thể tải lịch hẹn (${response.status}): ${errorText}`);
                }
                setAppointments([]);
                return false;
            }
            const data = await response.json();
            console.log("✅ [Admin] Appointments data fetched:", data);
            const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            setAppointments(sortedData);
            return true;
        } catch (error) {
            console.error("❌ [Admin] Error fetching appointments:", error);
            setError("Lỗi kết nối hoặc xử lý dữ liệu lịch hẹn.");
            setAppointments([]);
            return false;
        }
    };

    const fetchTechnicians = async () => {
        try {
            console.log("👨‍🔧 [Admin] Fetching technicians...");
            setError(null);
            const res = await fetch(`${API_BASE}/api/admin/technicians/available`, { // Dùng API KTV của Admin
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Admin] Technicians API failed:", res.status, errorText);
                if (res.status === 401) { setError("Phiên đăng nhập hết hạn khi tải KTV."); }
                else { setError(`Không thể tải danh sách KTV (${res.status}): ${errorText}`); }
                setTechnicians([]);
                return false;
            }
            const data = await res.json();
            console.log("✅ [Admin] Technicians data fetched:", data);
            if (!Array.isArray(data)) {
                console.warn("[Admin] API returned non-array for technicians, setting to empty array.");
                setTechnicians([]);
                return true;
            }
            // *** THAY ĐỔI CÁCH MAP ID *** (API Admin trả về TechnicianDTO với technicianId)
            const mapped = data.map((t) => ({
                userId: String(t.technicianId || ""), // Lấy technicianId làm key
                fullName: t.fullName || "N/A",
                activeBookings: 0, // API Admin không có activeBookings
            }));
            console.log("[Admin] Mapped technicians:", mapped);
            setTechnicians(mapped);
            return true;
        } catch (err) {
            console.error("❌ [Admin] Error fetching technicians:", err);
            setError("Lỗi kết nối hoặc xử lý dữ liệu kỹ thuật viên.");
            setTechnicians([]);
            return false;
        }
    };

    // --- useEffect Load Data (Giữ nguyên) ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await fetchUserInfo();
            await Promise.allSettled([fetchAppointments(), fetchTechnicians()]);
            setLoading(false);
        };
        if (!token) {
            setError("Vui lòng đăng nhập để truy cập trang này.");
            setLoading(false);
            navigate("/");
            return;
        }
        loadData();
    }, [token, navigate]); // Bỏ navigate khỏi dependency array nếu không cần

    // --- handleTechnicianChange (Giữ nguyên) ---
    const handleTechnicianChange = (bookingId, technicianId) => {
        console.log(`👤 [Admin] Technician selected for booking ${bookingId}: ${technicianId}`);
        setSelectedTechnicians((prev) => ({ ...prev, [bookingId]: technicianId }));
    };

    // --- getTechnicianName (Giữ nguyên) ---
    const getTechnicianName = (technicianId) => {
        if (!technicianId) return '—';
        const tech = technicians.find(t => String(t.userId) === String(technicianId)); // Vẫn dùng userId vì state đã map
        return tech ? tech.fullName : `KTV #${technicianId}`;
    };

    // --- handleAssign (Đổi API endpoint sang /api/admin) ---
    const handleAssign = async (bookingId) => {
        const technicianId = selectedTechnicians[bookingId];
        if (!technicianId) { setError("Vui lòng chọn một kỹ thuật viên để phân công."); return; }
        setActionLoading(bookingId);
        setError(null);
        try {
            console.log(`✍️ [Admin] Assigning technician ${technicianId} to booking ${bookingId}...`);
            // *** THAY ĐỔI ENDPOINT ***
            const res = await fetch(`${API_BASE}/api/admin/bookings/assign-technician`, { // Dùng API assign của Admin
                method: "POST", // API Admin dùng POST
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookingId: parseInt(bookingId), technicianId: parseInt(technicianId) }),
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Admin] Assignment API failed:", res.status, errorText);
                throw new Error(errorText || "Phân công thất bại.");
            }
            console.log(`✅ [Admin] Assignment successful for booking ${bookingId}`);
            setSelectedTechnicians((prev) => { const next = { ...prev }; delete next[bookingId]; return next; });
            await fetchAppointments();
            await fetchTechnicians();
        } catch (err) {
            console.error("❌ [Admin] Error assigning technician:", err);
            setError(`Lỗi khi phân công: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // --- handleApprove (Đổi API endpoint sang /api/admin và method sang PUT) ---
    const handleApprove = async (bookingId) => {
        setActionLoading(bookingId);
        setError(null);
        try {
            console.log(`👍 [Admin] Approving booking ${bookingId}...`);
            // *** THAY ĐỔI ENDPOINT VÀ METHOD ***
            const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/approve`, { // Dùng API approve của Admin
                method: "PUT", // API Admin dùng PUT
                headers: { Authorization: `Bearer ${token}` }, // Không cần Content-Type
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Admin] Approve API failed:", res.status, errorText);
                if (res.status === 401) { setError("Phiên đăng nhập hết hạn."); setTimeout(() => navigate("/"), 1500); }
                else { throw new Error(errorText || `Duyệt thất bại (${res.status})`); }
                return;
            }
            console.log(`✅ [Admin] Approve successful for booking ${bookingId}`);
            await fetchAppointments();
        } catch (err) {
            console.error("❌ [Admin] Error approving booking:", err);
            setError(`Lỗi khi duyệt: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // --- handleDecline (Đổi API endpoint sang /api/admin và method sang PUT) ---
    const handleDecline = async (bookingId) => {
        const reason = prompt("Nhập lý do từ chối (bắt buộc):");
        if (!reason) return;
        setActionLoading(bookingId);
        setError(null);
        try {
            console.log(`❌ [Admin] Declining booking ${bookingId} with reason: ${reason}...`);
            // *** THAY ĐỔI ENDPOINT VÀ METHOD ***
            const url = `${API_BASE}/api/admin/bookings/${bookingId}/decline?reason=${encodeURIComponent(reason)}`; // Dùng API decline của Admin
            const res = await fetch(url, {
                method: "PUT", // API Admin dùng PUT
                headers: { Authorization: `Bearer ${token}` }, // Không cần Accept
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Admin] Decline API failed:", res.status, errorText);
                throw new Error(errorText || "Từ chối thất bại.");
            }
            console.log(`✅ [Admin] Decline successful for booking ${bookingId}`);
            await fetchAppointments();
        } catch (err) {
            console.error("❌ [Admin] Error declining appointment:", err);
            setError(`Lỗi khi từ chối: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // --- handleHandover (Đổi API endpoint sang /api/admin và method sang PUT) ---
    const handleHandover = async (bookingId) => {
        if (!window.confirm("Bạn có chắc chắn muốn BÀN GIAO XE và hoàn tất booking này?")) return;
        setActionLoading(bookingId);
        setError(null);
        try {
            console.log(`🚀 [Admin] Handing over vehicle for booking ${bookingId}...`);
            // *** THAY ĐỔI ENDPOINT VÀ METHOD ***
            const url = `${API_BASE}/api/admin/bookings/${bookingId}/handover`; // Dùng API handover của Admin
            const res = await fetch(url, {
                method: "PUT", // API Admin dùng PUT
                headers: { Authorization: `Bearer ${token}` }, // Không cần Accept
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Admin] Handover API failed:", res.status, errorText);
                throw new Error(errorText || "Bàn giao thất bại.");
            }
            console.log(`✅ [Admin] Handover successful for booking ${bookingId}`);
            await fetchAppointments();
        } catch (err) {
            console.error("❌ [Admin] Error handing over vehicle:", err);
            setError(`Lỗi khi bàn giao: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // --- getStatusBadge (Giữ nguyên) ---
    const getStatusBadge = (status) => {
        const statusText = status ? status.toLowerCase() : 'unknown';
        let label = status || 'Không xác định';
        let className = 'status-default';
        switch (statusText) {
            case 'pending': label = 'Chờ xử lý'; className = 'status-pending'; break;
            case 'approved': label = 'Đã duyệt'; className = 'status-approved'; break;
            case 'assigned': label = 'Đã phân công'; className = 'status-assigned'; break;
            case 'in progress': label = 'Đang thực hiện'; className = 'status-inprogress'; break;
            case 'completed': label = 'Đã hoàn tất'; className = 'status-completed'; break;
            case 'declined': label = 'Đã từ chối'; className = 'status-declined'; break;
            case 'paid': label = 'Đã thanh toán'; className = 'status-paid'; break;
            case 'cancelled': label = 'Đã hủy'; className = 'status-declined'; break;
            default: label = status; break; // Hiển thị trạng thái gốc nếu không khớp
        }
        return <span className={`status-badge ${className}`}>{label}</span>;
    };

    // --- hasChecklist (Giữ nguyên) ---
    const hasChecklist = (status) => {
        const statusText = status ? status.toLowerCase() : '';
        return ['assigned', 'in progress', 'completed', 'paid'].includes(statusText);
    };

    // --- handleViewChecklist (Giữ nguyên, trỏ đến trang checklist của Staff) ---
    const handleViewChecklist = (bookingId) => {
        navigate(`/staff/checklist/${bookingId}`); // Admin vẫn xem trang checklist của Staff
    };

    // --- Auto refresh (Giữ nguyên) ---
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("🔁 [Admin] Auto refresh appointments (10s)...");
            fetchAppointments();
        }, 10000); // 10 giây
        return () => clearInterval(interval);
    }, []); // Chỉ chạy 1 lần khi mount

    // --- Render ---
    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <FaSpinner className="spinner" /> <p>Đang tải dữ liệu...</p>
                </main>
            </div>
        );
    }

    // Lọc dựa trên statusFilter
    const filteredAppointments = appointments.filter(appt =>
        statusFilter === 'all' || (appt.status && appt.status.toLowerCase() === statusFilter)
    );

    return (
        <div className="dashboard-container">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
            <main className="main-content">
                <header className="page-header">
                    <h1><FaCalendarAlt /> Quản lý lịch hẹn (Admin)</h1> {/* Đổi tiêu đề */}
                    <p>Xem xét, phân công và theo dõi các lịch hẹn của khách hàng.</p>
                </header>

                {error && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                        <button onClick={() => setError(null)} className="clear-error-btn">&times;</button>
                    </div>
                )}

                <div className="actions-bar">
                    <div className="filter-group">
                        <label htmlFor="statusFilter"><FaFilter /> Lọc:</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="status-filter-select"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="assigned">Đã phân công</option>
                            <option value="in progress">Đang thực hiện</option>
                            <option value="paid">Đã thanh toán (Chờ bàn giao)</option>
                            <option value="declined">Đã từ chối</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="completed">Đã hoàn tất </option>
                        </select>
                    </div>
                </div>

                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ngày hẹn</th>
                                    <th>Khách hàng</th>
                                    <th>Điện thoại</th>
                                    <th>Biển số</th>
                                    <th>Dòng xe</th>
                                    <th>Số KM</th>
                                    <th>Kỹ thuật viên</th>
                                    <th>Trạng thái </th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!error && filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((appt) => {
                                        const statusText = appt.status?.toLowerCase();
                                        const checklistStatusText = appt.checklistStatus?.toLowerCase();
                                        const isPending = statusText === 'pending';
                                        const isApproved = statusText === 'approved';
                                        const isPaid = statusText === 'paid';
                                        const isChecklistCompleted = checklistStatusText === 'completed';
                                        const hasAssignedTech = appt.technicianId || appt.technicianName;

                                        return (
                                            <tr key={appt.bookingId}>
                                                <td><span className="cell-main">#{appt.bookingId}</span></td>
                                                <td>
                                                    <span className="cell-main">{new Date(appt.bookingDate).toLocaleDateString("vi-VN")}</span>
                                                    <span className="cell-sub">{new Date(appt.bookingDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td><span className="cell-main">{appt.customerName}</span></td>
                                                <td><span className="cell-sub">{appt.customerPhone || 'N/A'}</span></td>
                                                <td><span className="cell-main">{appt.vehiclePlate}</span></td>
                                                <td><span className="cell-sub">{appt.vehicleModel}</span></td>
                                                <td><span className="cell-sub">{appt.currentKm ? `${appt.currentKm.toLocaleString()} km` : 'N/A'}</span></td>
                                                <td>
                                                    {isApproved && !hasAssignedTech ? (
                                                        <div className="technician-select-wrapper">
                                                            <select
                                                                className="technician-select"
                                                                value={selectedTechnicians[appt.bookingId] || ""}
                                                                onChange={(e) => handleTechnicianChange(appt.bookingId, e.target.value)}
                                                                disabled={actionLoading === appt.bookingId}
                                                            >
                                                                <option value="">-- Chọn KTV --</option>
                                                                {technicians.length > 0 ? (
                                                                    technicians.map((tech) => (
                                                                        <option key={tech.userId} value={tech.userId}>
                                                                            {tech.fullName} {/* ({tech.activeBookings} việc) - Admin API k có */}
                                                                        </option>
                                                                    ))
                                                                ) : (
                                                                    <option value="" disabled>Không có KTV</option>
                                                                )}
                                                            </select>
                                                        </div>
                                                    ) : isPending ? (
                                                        <span className="cell-sub">Chờ duyệt</span>
                                                    ) : (
                                                        <span className="cell-sub">{appt.technicianName || getTechnicianName(appt.technicianId) || '—'}</span>
                                                    )}
                                                </td>
                                                <td>{getStatusBadge(appt.status)}</td>
                                                <td>
                                                    {isPending ? (
                                                        <div className="action-buttons-cell">
                                                            <button className="btn-action btn-approve" onClick={() => handleApprove(appt.bookingId)} disabled={actionLoading === appt.bookingId}>
                                                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Duyệt
                                                            </button>
                                                            <button className="btn-action btn-decline" onClick={() => handleDecline(appt.bookingId)} disabled={actionLoading === appt.bookingId}>
                                                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaTimes />} Từ chối
                                                            </button>
                                                        </div>
                                                    ) : isApproved && !hasAssignedTech ? (
                                                        <div className="action-buttons-cell">
                                                            <button className="btn-action btn-assign" onClick={() => handleAssign(appt.bookingId)} disabled={!selectedTechnicians[appt.bookingId] || actionLoading === appt.bookingId}>
                                                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaUserCheck />} Phân công {/* Đổi Icon */}
                                                            </button>
                                                        </div>
                                                    ) : (isPaid && isChecklistCompleted) ? (
                                                        <button className="btn-action btn-handover" onClick={() => handleHandover(appt.bookingId)} disabled={actionLoading === appt.bookingId}>
                                                            {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCar />} Bàn giao {/* Đổi Icon */}
                                                        </button>
                                                    ) : hasChecklist(statusText) ? (
                                                        <button className="btn-action btn-view" onClick={() => handleViewChecklist(appt.bookingId)} disabled={actionLoading === appt.bookingId}>
                                                            <FaEye /> Xem Checklist
                                                        </button>
                                                    ) : (
                                                        <span className="cell-sub">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    !error && (
                                        <tr><td colSpan="10" className="empty-state"><p>{statusFilter === 'all' ? 'Hiện không có lịch hẹn nào.' : `Không có lịch hẹn nào ở trạng thái "${statusFilter}".`}</p></td></tr>
                                    )
                                )}
                                {error && filteredAppointments.length === 0 && (
                                    <tr><td colSpan="10" className="empty-state error-in-table"><FaExclamationTriangle /><p>Đã xảy ra lỗi khi tải dữ liệu.</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}