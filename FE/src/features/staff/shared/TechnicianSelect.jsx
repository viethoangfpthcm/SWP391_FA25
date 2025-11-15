import React from "react";
import "./TechnicianSelect.css";

export default function TechnicianSelect({
  bookingId,
  technicians,
  selectedTechnicians,
  onTechnicianChange,
  disabled
}) {
  const selectedTechId = selectedTechnicians[bookingId];
  const selectedTech = technicians.find(t => t.userId === selectedTechId);

  return (
    <div className="technician-select-wrapper">
      <select
        className="technician-select"
        value={selectedTechId || ""}
        onChange={(e) => onTechnicianChange(bookingId, e.target.value)}
        disabled={disabled}
      >
        <option value="">Chọn kỹ thuật viên</option>
        {technicians.length > 0 ? (
          technicians.map((tech) => (
            <option key={tech.userId} value={tech.userId}>
              {tech.fullName} ({tech.activeBookings} việc)
            </option>
          ))
        ) : (
          <option value="" disabled>
            Không có KTV
          </option>
        )}
      </select>
      {selectedTech && selectedTech.activeBookings > 0 && (
        <span className="tech-note">
          Đang bận {selectedTech.activeBookings} việc
        </span>
      )}
    </div>
  );
}