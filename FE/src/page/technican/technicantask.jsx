import React, { useEffect, useState } from "react";
import "./technicantask.css";

const TechnicianTask = ({ technicianId }) => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    fetch(`/api/checklists/technician/${technicianId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);

        const pending = data.filter((t) => t.status === "Pending").length;
        const inProgress = data.filter((t) => t.status === "In Progress").length;
        const completed = data.filter((t) => t.status === "Completed").length;

        setSummary({
          pending,
          inProgress,
          completed,
          total: data.length,
        });
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [technicianId]);

  return (
    <div className="technician-container">
      {/* Header */}
      <div className="header">
        <h1>Quản lý lịch hẹn</h1>
        <span className="role-badge">Technician</span>
      </div>

      {/* Summary */}
      <div className="status-summary">
        <div className="status-box orange">
          <p className="status-label">Chờ xử lý</p>
          <h2>{summary.pending}</h2>
        </div>
        <div className="status-box blue">
          <p className="status-label">Đang thực hiện</p>
          <h2>{summary.inProgress}</h2>
        </div>
        <div className="status-box green">
          <p className="status-label">Hoàn thành</p>
          <h2>{summary.completed}</h2>
        </div>
        <div className="status-box gray">
          <p className="status-label">Tổng nhiệm vụ</p>
          <h2>{summary.total}</h2>
        </div>
      </div>

      {/* Task list */}
      <div className="task-section">
        <h2>Nhiệm vụ được giao</h2>
        {tasks.length === 0 ? (
          <p className="no-task">Không có nhiệm vụ nào.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-info">
                  <p className="task-id">Mã nhiệm vụ: WO-2024-00{task.id}</p>
                  <p className="task-note">
                    Ghi chú: {task.note || "Không có ghi chú"}
                  </p>
                </div>
                <span
                  className={`task-status ${
                    task.status === "Pending"
                      ? "status-pending"
                      : task.status === "In Progress"
                      ? "status-progress"
                      : "status-done"
                  }`}
                >
                  {task.status === "Pending"
                    ? "Chờ xử lý"
                    : task.status === "In Progress"
                    ? "Đang thực hiện"
                    : "Hoàn thành"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianTask;
