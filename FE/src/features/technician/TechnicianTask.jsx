import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./TechnicianTask.css";
import Loading from "@components/ui/Loading.jsx";
import TechnicianHeader from "./TechnicianHeader.jsx";
import SummaryCards from "./SummaryCards.jsx";
import FilterButtons from "./FilterButtons.jsx";
import TaskTable from "./TaskTable.jsx";
import KmModal from "./KmModal.jsx";

const BOOKING_STATUS_MAP = {
  ASSIGNED: { text: "Chờ xử lý", className: "pending" },
  IN_PROGRESS: { text: "Đang xử lý", className: "in-progress" },
  COMPLETED: { text: "Hoàn thành", className: "completed" },
  DEFAULT: { text: "Không rõ", className: "default" },
};

const getStatusDisplay = (status) =>
  BOOKING_STATUS_MAP[status] || { text: status || "Không rõ", className: "default" };

export default function TechnicianTask() {
  const [userInfo, setUserInfo] = useState({ fullName: "Đang tải...", role: "" });
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [showKmModal, setShowKmModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [actualKm, setActualKm] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_BASE = "";

  // Fetch thông tin user
  const fetchUserInfo = async () => {
    if (!token) return navigate("/");
    try {
      const res = await fetch(`${API_BASE}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng.");
      const data = await res.json();
      const name = data.fullName || data.username || "Kỹ thuật viên";
      const role = data.role || "TECHNICIAN";
      setUserInfo({ fullName: name, role });
    } catch (err) {
      setError(`Lỗi tải thông tin người dùng: ${err.message}`);
    }
  };

  // Fetch nhiệm vụ
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/technician/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách nhiệm vụ");
      const data = await res.json();
      const pending = data.filter((t) => t.status === "ASSIGNED").length;
      const inProgress = data.filter((t) => t.status === "IN_PROGRESS").length;
      const completed = data.filter((t) => t.status === "COMPLETED").length;
      setTasks(data);
      setFilteredTasks(data);
      setSummary({ pending, inProgress, completed, total: data.length });
    } catch (err) {
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
    if (filterStatus === "all") setFilteredTasks(tasks);
    else if (filterStatus === "pending") setFilteredTasks(tasks.filter((t) => t.status === "ASSIGNED"));
    else if (filterStatus === "in-progress") setFilteredTasks(tasks.filter((t) => t.status === "IN_PROGRESS"));
    else if (filterStatus === "completed") setFilteredTasks(tasks.filter((t) => t.status === "COMPLETED"));
  }, [filterStatus, tasks]);

  const openKmModal = (bookingId) => {
    setCurrentBookingId(bookingId);
    setActualKm("");
    setShowKmModal(true);
  };

  const confirmStartTask = async () => {
    const km = parseInt(actualKm);
    if (isNaN(km) || km <= 0) return toast.error("Vui lòng nhập số km hợp lệ.");
    try {
      const res = await fetch(`${API_BASE}/api/technician/start/${currentBookingId}?actualKm=${km}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể bắt đầu nhiệm vụ.");
      toast.success("Nhiệm vụ đã bắt đầu!");
      setShowKmModal(false);
      await fetchTasks();
      navigate(`/checklist?bookingId=${currentBookingId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewTask = (bookingId) => navigate(`/checklist?bookingId=${bookingId}`);

  if (loading)
    return (
      <p className="loading">
        <Loading inline /> Đang tải dữ liệu...
      </p>
    );

  return (
    <div className="technician-page">
      <Sidebar user={userInfo} />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="content">
        <TechnicianHeader userInfo={userInfo} />
        {error && <div className="error-message">{error}</div>}
        <div className="inner">
          <SummaryCards summary={summary} />
          <div className="task-section">
            <div className="task-section-header">
              <h2>Nhiệm vụ được giao</h2>
              <FilterButtons
                summary={summary}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
              />
            </div>
            <TaskTable
              tasks={filteredTasks}
              getStatusDisplay={getStatusDisplay}
              onStart={openKmModal}
              onView={handleViewTask}
            />
          </div>
        </div>
      </div>

      {showKmModal && (
        <KmModal
          actualKm={actualKm}
          setActualKm={setActualKm}
          onConfirm={confirmStartTask}
          onCancel={() => setShowKmModal(false)}
        />
      )}
    </div>
  );
}
