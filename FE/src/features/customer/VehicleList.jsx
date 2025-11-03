import React from "react";
import Button from "@components/ui/Button.jsx";
import { FaCar, FaPlus } from "react-icons/fa";

function VehicleList({ vehicles = [], onAdd, onDelete, onViewSchedule }) {
  return (
    <section className="dashboard-section vehicle-section">
      <div className="vehicle-header">
        <h2><FaCar /> Danh sách xe</h2>
        <Button className="add-vehicle-btn" onClick={onAdd}>
          <FaPlus /> Thêm xe
        </Button>
      </div>

      {vehicles.length > 0 ? (
        <div className="vehicle-list">
          {vehicles.map((v) => (
            <div key={v.licensePlate} className="vehicle-card">
              <h3>{v.model} ({v.year})</h3>
              <p><strong>Biển số:</strong> {v.licensePlate}</p>
              <p><strong>Số km hiện tại:</strong> {v.currentKm?.toLocaleString() || "Chưa cập nhật"} km</p>
              <div className="vehicle-actions">
                <Button onClick={() => onViewSchedule(v.licensePlate)}>Xem lịch bảo dưỡng</Button>
                <Button className="btn-delete" onClick={() => onDelete(v.licensePlate)}>Xóa xe</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Bạn chưa thêm xe nào.</p>
      )}
    </section>
  );
}

export default VehicleList;
