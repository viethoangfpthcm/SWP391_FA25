import React from "react";
import { FaCheck, FaTimes, FaEye, FaComments, FaDollarSign } from "react-icons/fa";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import "./BookingActions.css";

export default function BookingActions({
  booking,
  isPending,
  isApproved,
  hasAssignedTech,
  isPaid,
  isChecklistCompleted,
  isAssigned,
  isInProgress,
  isCompleted,
  selectedTechnicians,
  actionLoading,
  onApprove,
  onDecline,
  onAssign,
  onHandover,
  onViewChecklist,
  onViewFeedback,
  onViewPayment
}) {
  const bookingId = booking.bookingId;

  if (isPending) {
    return (
      <div className="action-buttons-cell">
        <Button
          className="btn-action btn-approve"
          onClick={() => onApprove(bookingId)}
          disabled={actionLoading === bookingId}
        >
          {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} Duyệt
        </Button>
        <Button
          className="btn-action btn-decline"
          onClick={() => onDecline(bookingId)}
          disabled={actionLoading === bookingId}
        >
          {actionLoading === bookingId ? <Loading inline /> : <FaTimes />} Từ chối
        </Button>
      </div>
    );
  }

  if (isApproved && !hasAssignedTech) {
    return (
      <div className="action-buttons-cell">
        <Button
          className="btn-action btn-assign"
          onClick={() => onAssign(bookingId)}
          disabled={!selectedTechnicians[bookingId] || actionLoading === bookingId}
        >
          {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} Phân công
        </Button>
      </div>
    );
  }

  if (isPaid && isChecklistCompleted) {
    return (
      <Button
        className="btn-action btn-handover"
        onClick={() => onHandover(bookingId)}
        disabled={actionLoading === bookingId}
      >
        {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} Bàn giao
      </Button>
    );
  }

  if (isAssigned || isInProgress || isPaid || isCompleted) {
    return (
      <div className="action-buttons-cell">
        <Button
          className="btn-action btn-view"
          onClick={() => onViewChecklist(bookingId)}
          disabled={actionLoading === bookingId}
          title="Xem chi tiết checklist"
        >
          <FaEye /> Xem
        </Button>
        {(isPaid || isCompleted) && (
          <>
            <Button
              className="btn-action btn-payment"
              onClick={() => onViewPayment(bookingId)}
              title="Xem thông tin thanh toán"
            >
              <FaDollarSign /> Payment
            </Button>
            <Button
              className="btn-action btn-feedback"
              onClick={() => onViewFeedback(bookingId)}
              title="Xem feedback khách hàng"
            >
              <FaComments /> Feedback
            </Button>
          </>
        )}
      </div>
    );
  }

  return <span className="cell-sub">—</span>;
}