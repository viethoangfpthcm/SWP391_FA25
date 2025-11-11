import React from 'react';
import { FaCar, FaPlus } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import VehicleCard from './VehicleCard.jsx';
import './VehicleSection.css';

export default function VehicleSection({ vehicles, onAddClick, onViewSchedule, onDelete }) {
  return (
    <section className="dashboard-section vehicle-section">
      <div className="vehicle-header">
        <h2><FaCar /> Danh sách xe</h2>
        <Button className="add-vehicle-btn" onClick={onAddClick} title="Thêm xe mới">
          <FaPlus /> Thêm xe
        </Button>
      </div>
      {vehicles && vehicles.length > 0 ? (
        <div className="vehicle-list">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.licensePlate} vehicle={vehicle} onViewSchedule={onViewSchedule} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <p>Bạn chưa thêm xe nào.</p>
      )}
    </section>
  );
}
