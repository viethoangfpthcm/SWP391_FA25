import React from "react";
import Button from "@components/ui/Button.jsx";
import { FaPlay, FaEye } from "react-icons/fa6";

const TaskTable = ({ tasks, getStatusDisplay, onStart, onView }) => {
  if (!tasks || tasks.length === 0)
    return <p className="no-task">Không có nhiệm vụ nào phù hợp.</p>;

  const order = { ASSIGNED: 1, IN_PROGRESS: 2, COMPLETED: 3 };

  return (
    <div className="task-list">
      {[...tasks]
        .sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99))
        .map((task) => (
          <div key={task.bookingId} className="task-card">
            <div className="task-header">
              <span
                className={`status-badge ${getStatusDisplay(task.status).className}`}
              >
                {getStatusDisplay(task.status).text}
              </span>
              <span className="task-id">Mã Booking: {task.bookingId}</span>
            </div>
            <div className="task-body">
              <p><strong>Tên khách hàng:</strong> {task.customerName}</p>
              <p><strong>Mẫu xe:</strong> {task.vehicleModel}</p>
              <p><strong>Biển số xe:</strong> {task.vehiclePlate}</p>
              <p><strong>Ngày hẹn:</strong> {new Date(task.bookingDate).toLocaleDateString()}</p>
              <p><strong>Gói bảo dưỡng:</strong> {task.maintenancePlanName || "Không có"}</p>
              <p><strong>Ghi chú:</strong> {task.note || "Không có"}</p>
            </div>
            <div className="task-footer">
              {task.status === "ASSIGNED" ? (
                <Button className="btn-start" onClick={() => onStart(task.bookingId)}>
                  <FaPlay /> Bắt đầu
                </Button>
              ) : (
                <Button className="btn-view" onClick={() => onView(task.bookingId)}>
                  <FaEye /> Xem chi tiết
                </Button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TaskTable;
