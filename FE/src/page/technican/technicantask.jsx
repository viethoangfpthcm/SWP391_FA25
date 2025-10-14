import React, {useEffect, useState} from "react";
import {
    FaBars,
    FaClock,
    FaScrewdriverWrench,
    FaCircleCheck,
    FaClipboardList,
    FaPlay,
} from "react-icons/fa6";
import Sidebar from "../sidebar/sidebar";
import {useNavigate} from "react-router-dom";
import "./technicantask.css";

export default function TechnicianTask() {
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🟢 Lấy danh sách nhiệm vụ
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/technician/my-tasks", {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (!res.ok) throw new Error("Không thể tải danh sách nhiệm vụ");
            const data = await res.json();

            const pending = data.filter((t) => t.status === "Chờ xử lý").length;
            const inProgress = data.filter((t) => t.status === "Đang thực hiện").length;
            const completed = data.filter((t) => t.status === "Hoàn thành").length;

            setTasks(data);
            setSummary({
                pending,
                inProgress,
                completed,
                total: data.length,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // 🟡 Bắt đầu nhiệm vụ → gọi API + chuyển checklist
    const handleStartTask = async (bookingId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:8080/api/technician/start/${bookingId}`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            if (!res.ok) throw new Error("Không thể bắt đầu nhiệm vụ này");
            navigate("/checklist");
        } catch (err) {
            console.error("Lỗi khi bắt đầu nhiệm vụ:", err);
            alert("Không thể bắt đầu nhiệm vụ. Vui lòng thử lại!");
        }
    };

    if (loading) return <p className="loading">⏳ Đang tải dữ liệu...</p>;

    return (
        <div
            className={`technician-page ${
                sidebarOpen ? "sidebar-open" : "sidebar-closed"
            }`}
        >
            <Sidebar sidebarOpen={sidebarOpen}/>

            <div className="content">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <FaBars
                            className="menu-icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                        <div className="header-text">
                            <h1>EV SERVICE</h1>
                            <p>Technician Management System</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <span className="technician-name">Kỹ thuật viên</span>
                    </div>
                </header>

                {/* Nội dung */}
                <div className="inner">
                    {/* Thống kê */}
                    <div className="summary-cards">
                        <div className="card pending">
                            <FaClock/>
                            <h3>Chờ xử lý</h3>
                            <p>{summary.pending}</p>
                        </div>
                        <div className="card in-progress">
                            <FaScrewdriverWrench/>
                            <h3>Đang thực hiện</h3>
                            <p>{summary.inProgress}</p>
                        </div>
                        <div className="card completed">
                            <FaCircleCheck/>
                            <h3>Hoàn thành</h3>
                            <p>{summary.completed}</p>
                        </div>
                        <div className="card total">
                            <FaClipboardList/>
                            <h3>Tổng nhiệm vụ</h3>
                            <p>{summary.total}</p>
                        </div>
                    </div>

                    {/* Danh sách nhiệm vụ */}
                    <div className="task-section">
                        <h2>Nhiệm vụ được giao</h2>

                        {tasks.length === 0 ? (
                            <p className="no-task">Không có nhiệm vụ nào được giao.</p>
                        ) : (
                            <div className="task-list">
                                {tasks.map((task) => (
                                    <div key={task.bookingId} className="task-card">
                                        <div className="task-header">
                      <span
                          className={`status-badge ${
                              task.status === "Chờ xử lý"
                                  ? "pending"
                                  : task.status === "Đang thực hiện"
                                      ? "in-progress"
                                      : "completed"
                          }`}
                      >
                        {task.status}
                      </span>
                                            <span className="task-id">
                        Mã nhiệm vụ: {task.bookingId}
                      </span>
                                        </div>

                                        <div className="task-body">
                                            <p>
                                                <strong>Tên khách hàng:</strong> {task.customerName}
                                            </p>
                                            <p>
                                                <strong>Biển số xe:</strong> {task.vehiclePlate}
                                            </p>
                                            <p>
                                                <strong>Ngày hẹn:</strong>{" "}
                                                {new Date(task.bookingDate).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <strong>Kỹ thuật viên:</strong>{" "}
                                                {task.assignedTechnician || "—"}
                                            </p>
                                            <p>
                                                <strong>Địa chỉ:</strong> {task.address || "Không có"}
                                            </p>
                                            <p>
                                                <strong>Ghi chú:</strong> {task.note || "Không có"}
                                            </p>
                                        </div>

                                        <div className="task-footer">
                                            <button
                                                className="btn-start"
                                                onClick={() => handleStartTask(task.bookingId)}
                                            >
                                                <FaPlay/> Bắt đầu
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
