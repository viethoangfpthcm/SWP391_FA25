// /src/page/staff/ActiveButtons.jsx
import React from "react";
import { FaCheck, FaTimes, FaEye, FaSpinner } from "react-icons/fa";

/**
 * Small component to render action buttons for a booking row.
 * Expects appt and boolean flags + handlers.
 */
export default function ActiveButtons({
  appt,
  isPending,
  isApproved,
  isAssigned,
  isInProgress,
  isPaid,
  isCompleted,
  checklistDone,
  actionLoading,
  onApprove,
  onDecline,
  onAssign,
  onHandover,
  onViewChecklist,
}) {
  const loading = actionLoading === appt.bookingId;

  if (isPending) {
    return (
      <div className="action-buttons-cell">
        <button
          className="btn-action btn-approve"
          onClick={() => onApprove(appt.bookingId)}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Duyệt
        </button>
        <button
          className="btn-action btn-decline"
          onClick={() => onDecline(appt.bookingId)}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinner-icon" /> : <FaTimes />} Từ chối
        </button>
      </div>
    );
  }

  if (isApproved && !isAssigned) {
    return (
      <div className="action-buttons-cell">
        <button
          className="btn-action btn-assign"
          onClick={() => onAssign(appt.bookingId)}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Phân công
        </button>
      </div>
    );
  }

  if (isPaid && checklistDone) {
    return (
      <button
        className="btn-action btn-handover"
        onClick={() => onHandover(appt.bookingId)}
        disabled={loading}
      >
        {loading ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Bàn giao
      </button>
    );
  }

  if (isAssigned || isInProgress || isPaid || isCompleted) {
    return (
      <button
        className="btn-action btn-view"
        onClick={() => onViewChecklist(appt.bookingId)}
        disabled={loading}
      >
        <FaEye /> Xem
      </button>
    );
  }

  return <span className="cell-sub">—</span>;
}
