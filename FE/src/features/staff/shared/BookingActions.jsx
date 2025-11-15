import React from "react";
import { FaClipboardList, FaComments, FaDollarSign, FaCheck, FaTimes } from "react-icons/fa";
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
          title="Duyệt"
        >
          {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} <span className="btn-label">Duyệt</span>
        </Button>
        <Button
          className="btn-action btn-decline"
          onClick={() => onDecline(bookingId)}
          disabled={actionLoading === bookingId}
          title="Từ chối"
        >
          {actionLoading === bookingId ? <Loading inline /> : <FaTimes />} <span className="btn-label">Từ chối</span>
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
          title="Phân công"
        >
         {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} <span className="btn-label">Phân công</span>
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
        title="Bàn giao"
      >
        {actionLoading === bookingId ? <Loading inline /> : <FaCheck />} <span className="btn-label">Bàn giao</span>
      </Button>
    );
  }
  if (isAssigned || isInProgress || isPaid || isCompleted) {
    return (
      <div className="action-buttons-cell">
        <Button
          className="btn-action btn-checklist"
          onClick={() => onViewChecklist(bookingId)}
          disabled={actionLoading === bookingId}
          title="Xem chi tiết checklist"
        >
          <FaClipboardList /> Checklist
        </Button>

        <Button
          className="btn-action btn-feedback"
          onClick={() => onViewFeedback(bookingId)}
          disabled={actionLoading === bookingId}
          title="Xem đánh giá của khách hàng"
        >
          <FaComments /> Feedback
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