// /src/page/staff/BookingRow.jsx
import React from "react";
import ActiveButtons from "./ActiveButtons.jsx";

/**
 * Props:
 * - appt: appointment object
 * - technicians: array
 * - selectedTechnician: string or null
 * - actionLoading: id|null
 * - onTechnicianChange(bookingId, techId)
 * - onApprove(bookingId)
 * - onDecline(bookingId)
 * - onAssign(bookingId)
 * - onHandover(bookingId)
 * - onViewChecklist(bookingId)
 */
export default function BookingRow({
  appt,
  technicians = [],
  selectedTechnician,
  actionLoading,
  onTechnicianChange,
  onApprove,
  onDecline,
  onAssign,
  onHandover,
  onViewChecklist,
}) {
  const status = (appt.status || "").toLowerCase();
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isAssigned = status === "assigned" || !!appt.technicianName;
  const isInProgress = status === "in_progress";
  const isPaid = status === "paid";
  const isCompleted = status === "completed";
  const checklistDone = (appt.checklistStatus || "").toLowerCase() === "completed";
  const hasAssignedTech = !!appt.technicianName;

  return (
    <tr>
      <td><span className="cell-main">#{appt.bookingId}</span></td>
      <td>
        <span className="cell-main">{new Date(appt.bookingDate).toLocaleDateString("vi-VN")}</span>
        <span className="cell-sub">{new Date(appt.bookingDate).toLocaleTimeString("vi-VN", {hour:'2-digit', minute:'2-digit'})}</span>
      </td>
      <td><span className="cell-main">{appt.customerName}</span></td>
      <td><span className="cell-sub">{appt.customerPhone || '—'}</span></td>
      <td><span className="cell-main">{appt.vehiclePlate || '—'}</span></td>
      <td><span className="cell-sub">{appt.vehicleModel || '—'}</span></td>
      <td><span className="cell-sub">{appt.currentKm ? `${appt.currentKm.toLocaleString()} km` : '—'}</span></td>

      <td>
        {isApproved && !hasAssignedTech ? (
          <div className="technician-select-wrapper">
            <select
              className="technician-select"
              value={selectedTechnician || ""}
              onChange={(e) => onTechnicianChange(appt.bookingId, e.target.value)}
              disabled={actionLoading === appt.bookingId}
            >
              <option value="">-- Chọn KTV --</option>
              {technicians.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.fullName} ({t.activeBookings} việc)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="cell-sub">{appt.technicianName || '—'}</span>
        )}
      </td>

      <td>
        <span className={`status-badge ${ (appt.status || 'DEFAULT').toLowerCase() }`}>
          {/* Keep original mapping in CSS via class names, text shown by parent may be needed; fallback to raw */}
          {appt.status || 'Không rõ'}
        </span>
      </td>

      <td>
        <ActiveButtons
          appt={appt}
          isPending={isPending}
          isApproved={isApproved}
          isAssigned={isAssigned}
          isInProgress={isInProgress}
          isPaid={isPaid}
          isCompleted={isCompleted}
          checklistDone={checklistDone}
          actionLoading={actionLoading}
          onApprove={onApprove}
          onDecline={onDecline}
          onAssign={onAssign}
          onHandover={onHandover}
          onViewChecklist={onViewChecklist}
        />
      </td>
    </tr>
  );
}
