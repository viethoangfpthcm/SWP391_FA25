import React, { useEffect, useState } from "react";
import { FaBars, FaClock, FaTools, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import Sidebar from "../sidebar/sidebar";
import "./technicantask.css";

const TechnicianTask = ({ technicianId }) => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      .catch((err) => console.error("Error:", err));
  }, [technicianId]);

  return (
    <div className={`technician-page ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="header-text">
              <h1>EV SERVICE</h1>
              <p>Management System</p>
            </div>
          </div>
          <div className="header-right">
            <span className="technician-name">Technician</span>
          </div>
        </header>

        <div className="inner">
          {/* Summary */}
          <div className="summary-cards">
            <div className="card pending">
              <FaClock />
              <h3>Chờ xử lý</h3>
              <p>{summary.pending}</p>
            </div>
            <div className="card in-progress">
              <FaTools />
              <h3>Đang thực hiện</h3>
              <p>{summary.inProgress}</p>
            </div>
            <div className="card completed">
              <FaCheckCircle />
              <h3>Hoàn thành</h3>
              <p>{summary.completed}</p>
            </div>
            <div className="card total">
              <FaClipboardList />
              <h3>Tổng nhiệm vụ</h3>
              <p>{summary.total}</p>
            </div>
          </div>

          {/* Task Table */}
          <div className="task-section">
            <h2>Danh sách nhiệm vụ</h2>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Mã nhiệm vụ</th>
                  <th>Tên nhiệm vụ</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.name}</td>
                    <td>{task.status}</td>
                    <td>{task.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianTask;
