import React from 'react';
import Button from '@components/ui/Button.jsx';
import './VehicleCard.css';

export default function VehicleCard({ vehicle, onViewSchedule, onDelete }) {
  return (
    <div className="vehicle-card">
      <h3>{vehicle.model} ({vehicle.year})</h3>
      <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
      <p><strong>Số KM hiện tại:</strong> {vehicle.currentKm?.toLocaleString() || 'Chưa cập nhật'} km</p>
      <div className="vehicle-actions">
        <Button onClick={() => onViewSchedule(vehicle.licensePlate)}>Xem lịch bảo dưỡng</Button>
        <Button className="btn-delete" onClick={() => onDelete(vehicle.licensePlate)}>Xóa xe</Button>
      </div>
    </div>
  );
}
