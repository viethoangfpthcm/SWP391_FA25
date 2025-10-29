import React, { useEffect, useState } from "react";
import {
    FaClock,
    FaScrewdriverWrench,
    FaCircleCheck,
    FaClipboardList,
    FaPlay,
    FaEye,
    FaSpinner,
} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../sidebar/sidebar";
import { useNavigate } from "react-router-dom";
import "./technicantask.css";
import "react-toastify/dist/ReactToastify.css";
const BOOKING_STATUS_MAP = {
    ASSIGNED: { text: 'Chờ xử lý', className: 'pending' },
    IN_PROGRESS: { text: 'Đang xử lý', className: 'in-progress' },
    COMPLETED: { text: 'Hoàn thành', className: 'completed' },
    DEFAULT: { text: 'Không rõ', className: 'default' }
};
const getStatusDisplay = (status) => {
    return BOOKING_STATUS_MAP[status] || { text: status || 'Không rõ', className: 'default' };
};

export default function TechnicianTask() {
    const [userInfo, setUserInfo] = useState({ fullName: "Đang tải...", role: "" });
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [summary, setSummary] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [error, setError] = useState(null);
    const [showKmModal, setShowKmModal] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [actualKm, setActualKm] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const API_BASE = "https://103.90.226.216:8443";



    // Fetch thông tin người dùng
    const fetchUserInfo = async () => {
        if (!token) {
            navigate("/");
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                    navigate("/");
                    return;
                }
                throw new Error("Không thể tải thông tin người dùng.");
            }
            const data = await res.json();
            const name = data.fullName || data.username || "Kỹ thuật viên";
            const role = data.role || "TECHNICIAN";
            localStorage.setItem("fullName", name);
            localStorage.setItem("role", role);
            setUserInfo({ fullName: name, role });
        } catch (err) {
            setError(`Lỗi tải thông tin người dùng: ${err.message}`);
        }
    };

    // Fetch danh sách nhiệm vụ
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/technician/my-tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                if (res.status === 401) throw new Error("Unauthorized");
                throw new Error("Không thể tải danh sách nhiệm vụ");
            }

            const data = await res.json();

            // Đếm số lượng theo trạng thái
            const pending = data.filter((t) => t.status === "ASSIGNED").length;
            const inProgress = data.filter((t) => t.status === "IN_PROGRESS").length;
            const completed = data.filter((t) => t.status === "COMPLETED").length;

            setTasks(data);
            setFilteredTasks(data);
            setSummary({ pending, inProgress, completed, total: data.length });
        } catch (err) {
            if (err.message.includes("Unauthorized")) {
                localStorage.removeItem("token");
                navigate("/");
                return;
            }
            setError(`Lỗi tải nhiệm vụ: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchTasks();
    }, []);

    // Lọc theo trạng thái
    useEffect(() => {
        if (filterStatus === "all") {
            setFilteredTasks(tasks);
        } else if (filterStatus === "pending") {
            setFilteredTasks(tasks.filter((t) => t.status === "ASSIGNED"));
        } else if (filterStatus === "in-progress") {
            setFilteredTasks(tasks.filter((t) => t.status === "IN_PROGRESS"));
        } else if (filterStatus === "completed") {
            setFilteredTasks(tasks.filter((t) => t.status === "COMPLETED"));
        } else {
            setFilteredTasks([]);
        }
    }, [filterStatus, tasks]);

    const openKmModal = (bookingId) => {
        setCurrentBookingId(bookingId);
        setActualKm("");
        setShowKmModal(true);
    };

    const confirmStartTask = async () => {
        const km = parseInt(actualKm);
        if (isNaN(km) || km <= 0) {
            toast.error("Vui lòng nhập số km hợp lệ (lớn hơn 0).");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/api/technician/start/${currentBookingId}?actualKm=${km}`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("Không thể bắt đầu nhiệm vụ này.");

            toast.success("Nhiệm vụ đã được bắt đầu!");
            setShowKmModal(false);
            await fetchTasks();
            navigate(`/checklist?bookingId=${currentBookingId}`);
        } catch (err) {
            toast.error(`Bắt đầu thất bại: ${err.message}`);
        }
    };

    const handleViewTask = (bookingId) => navigate(`/checklist?bookingId=${bookingId}`);

    if (loading)
        return (
            <p className="loading">
                <FaSpinner className="spinner-icon" /> Đang tải dữ liệu...
            </p>
        );

    return (
        <div className="technician-page">
            <Sidebar user={userInfo} />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="content">
                <header className="header">
                    <div className="header-left">
                        <div className="header-text">
                            <h1>EV SERVICE</h1>
                            <p>Technician Management System</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <span className="technician-name">{userInfo.fullName}</span>
                    </div>
                </header>

                {error && <div className="error-message">{error}</div>}

                <div className="inner">
                    {/* --- Thống kê tổng quan --- */}
                    <div className="summary-cards">
                        <div className="card pending">
                            <FaClock />
                            <h3>Chờ xử lý</h3>
                            <p>{summary.pending}</p>
                        </div>
                        <div className="card in-progress">
                            <FaScrewdriverWrench />
                            <h3>Đang thực hiện</h3>
                            <p>{summary.inProgress}</p>
                        </div>
                        <div className="card completed">
                            <FaCircleCheck />
                            <h3>Hoàn thành</h3>
                            <p>{summary.completed}</p>
                        </div>
                        <div className="card total">
                            <FaClipboardList />
                            <h3>Tổng nhiệm vụ</h3>
                            <p>{summary.total}</p>
                        </div>
                    </div>

                    {/* --- Danh sách nhiệm vụ --- */}
                    <div className="task-section">
                        <div className="task-section-header">
                            <h2>Nhiệm vụ được giao</h2>
                            <div className="filter-buttons">
                                {[
                                    ["all", "Tất cả", summary.total],
                                    ["pending", "Chờ xử lý", summary.pending],
                                    ["in-progress", "Đang thực hiện", summary.inProgress],
                                    ["completed", "Hoàn thành", summary.completed],
                                ].map(([key, label, count]) => (
                                    <button
                                        key={key}
                                        className={`filter-btn ${filterStatus === key ? "active" : ""}`}
                                        onClick={() => setFilterStatus(key)}
                                    >
                                        {label} ({count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredTasks.length === 0 ? (
                            <p className="no-task">Không có nhiệm vụ nào phù hợp.</p>
                        ) : (
                            <div className="task-list">
                                {[...filteredTasks]
                                    .sort((a, b) => {
                                        const order = { "ASSIGNED": 1, "IN_PROGRESS": 2, "COMPLETED": 3 };
                                        const rankA = order[a.status] || Infinity;
                                        const rankB = order[b.status] || Infinity;
                                        return rankA - rankB;
                                    })
                                    .map((task) => (
                                        <div key={task.bookingId} className="task-card">
                                            <div className="task-header">
                                                <span
                                                    className={`status-badge ${getStatusDisplay(task.status).className}`}
                                                >
                                                    {getStatusDisplay(task.status).text}
                                                </span>

                                                <span className="task-id">
                                                    Mã Booking: {task.bookingId}
                                                </span>
                                            </div>

                                            <div className="task-body">
                                                <p>
                                                    <strong>Tên khách hàng:</strong>{" "}
                                                    {task.customerName}
                                                </p>
                                                <p>
                                                    <strong>Mẫu xe:</strong> {task.vehicleModel}
                                                </p>
                                                <p>
                                                    <strong>Biển số xe:</strong> {task.vehiclePlate}
                                                </p>
                                                <p>
                                                    <strong>Ngày hẹn:</strong>{" "}
                                                    {new Date(task.bookingDate).toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <strong>Gói bảo dưỡng:</strong>{" "}
                                                    {task.maintenancePlanName || "Không có"}
                                                </p>
                                                <p>
                                                    <strong>Ghi chú:</strong>{" "}
                                                    {task.note || "Không có"}
                                                </p>
                                            </div>

                                            <div className="task-footer">
                                                {task.status === "ASSIGNED" && (
                                                    <button
                                                        className="btn-start"
                                                        onClick={() => openKmModal(task.bookingId)}
                                                    >
                                                        <FaPlay /> Bắt đầu
                                                    </button>
                                                )}
                                                {(task.status === "IN_PROGRESS" || task.status === "COMPLETED") && (
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => handleViewTask(task.bookingId)}
                                                    >
                                                        <FaEye /> Xem chi tiết
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal nhập km */}
            {showKmModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Nhập số KM hiện tại của xe</h3>
                        <input
                            type="number"
                            placeholder="Nhập Actual KM..."
                            value={actualKm}
                            onChange={(e) => {
                                if (
                                    e.target.value === "" ||
                                    parseFloat(e.target.value) >= 0
                                ) {
                                    setActualKm(e.target.value);
                                }
                            }}
                            min="0"
                        />
                        <div className="modal-buttons">
                            <button onClick={confirmStartTask} className="confirm-btn">
                                Xác nhận
                            </button>
                            <button
                                onClick={() => setShowKmModal(false)}
                                className="cancel-btn"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
