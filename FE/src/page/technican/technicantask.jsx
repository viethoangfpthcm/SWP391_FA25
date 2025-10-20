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

    // Hàm dịch trạng thái từ API sang tiếng Việt
    const translateStatus = (status) => {
        switch (status) {
            case "Assigned":
                return "Chờ xử lý";
            case "In Progress":
                return "Đang thực hiện";
            case "Completed":
                return "Hoàn thành";
            default:
                return status;
        }
    };

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

            // Đếm theo trạng thái (dựa trên API gốc)
            const pending = data.filter((t) => t.status === "Assigned").length;
            const inProgress = data.filter((t) => t.status === "In Progress").length;
            const completed = data.filter((t) => t.status === "Completed").length;

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


    useEffect(() => {
        if (filterStatus === "all") setFilteredTasks(tasks);
        else if (filterStatus === "pending")
            setFilteredTasks(tasks.filter((t) => t.status === "Assigned"));
        else if (filterStatus === "in-progress")
            setFilteredTasks(tasks.filter((t) => t.status === "In Progress"));
        else if (filterStatus === "completed")
            setFilteredTasks(tasks.filter((t) => t.status === "Completed"));
    }, [filterStatus, tasks]);


    const openKmModal = (bookingId) => {
        setCurrentBookingId(bookingId);
        setActualKm("");
        setShowKmModal(true);
    };

    // Xác nhận bắt đầu nhiệm vụ
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
                <FaSpinner className="spinner-icon" /> ⏳ Đang tải dữ liệu...
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
                    {/* Thống kê tổng quan */}
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

                    {/* Danh sách nhiệm vụ */}
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
                                {filteredTasks.map((task) => (
                                    <div key={task.bookingId} className="task-card">
                                        <div className="task-header">
                                            <span
                                                className={`status-badge ${task.status === "Assigned"
                                                    ? "pending"
                                                    : task.status === "In Progress"
                                                        ? "in-progress"
                                                        : "completed"
                                                    }`}
                                            >
                                                {translateStatus(task.status)}
                                            </span>
                                          
                                            <span className="task-id">Mã Booking: {task.bookingId}</span>
                                        </div>

                                        <div className="task-body">
                                            <p>
                                                <strong>Tên khách hàng:</strong> {task.customerName}
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
                                                <strong>Ghi chú:</strong> {task.note || "Không có"}
                                            </p>
                                        </div>

                                        <div className="task-footer">
                                            {task.status === "Assigned" && (
                                                <button
                                                    className="btn-start"
                                                    onClick={() => openKmModal(task.bookingId)}
                                                >
                                                    <FaPlay /> Bắt đầu
                                                </button>
                                            )}
                                            {task.status === "In Progress" && (
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewTask(task.bookingId)}
                                                >
                                                    <FaEye /> Xem chi tiết
                                                </button>
                                            )}
                                            {task.status === "Completed" && (
                                                <button
                                                    className="task-btn view completed"
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
                            onChange={(e) => setActualKm(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={confirmStartTask} className="confirm-btn">
                                Xác nhận
                            </button>
                            <button onClick={() => setShowKmModal(false)} className="cancel-btn">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
