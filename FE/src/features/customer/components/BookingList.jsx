import React from 'react';
import Button from '@components/ui/Button.jsx';
import { FaTimes, FaStar } from 'react-icons/fa';
import './BookingList.css';

export default function BookingList({
  title,
  bookings,
  loading,
  getStatusDisplay,
  onCancel,
  onFeedback,
  mode = "history" // "processing" hoặc "history"
}) {
const normalizeStatusClass = (statusObj) => {
  if (!statusObj || !statusObj.className) return "pending";

  return statusObj.className
    .toLowerCase()
    .replace("-", "_"); // ép in-progress → in_progress
};

  // 👉 Hàm render booking item (TRUYỀN ĐẦY ĐỦ THAM SỐ)
const renderBookingItem = (booking) => {
  const statusObj = getStatusDisplay(booking.status);
  const statusClass = normalizeStatusClass(statusObj);

  return (
    <div
      key={booking.bookingId}
      className={`booking-item status-${statusClass}`}
    >
      <div className="booking-item-header">
        <strong>{booking.vehiclePlate}</strong> ({booking.vehicleModel})
        <span className={`booking-status status-label-${statusClass}`}>
          {statusObj.text}
        </span>
      </div>

      <p><strong>Trung tâm:</strong> {booking.centerName}</p>
      <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>

      {booking.note && (
        <p className="booking-note"><strong>Ghi chú:</strong> {booking.note}</p>
      )}

      {onCancel && booking.status === "PENDING" && (
        <Button className="btn-cancel-small" onClick={() => onCancel(booking.bookingId)}>
          <FaTimes /> Hủy
        </Button>
      )}

      {onFeedback && booking.status === "COMPLETED" && (
        <Button className="btn-feedback" onClick={() => onFeedback(booking.bookingId)}>
          <FaStar /> {booking.hasFeedback ? "Sửa đánh giá" : "Đánh giá"}
        </Button>
      )}
    </div>
  );
};



  // ======================================================
  // 1️⃣ MODE = PROCESSING → Chờ xử lý | Đang xử lý
  // ======================================================
  if (mode === "processing") {
    const pending = bookings
      .filter(b => b.status === "PENDING")
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    const inProgress = bookings
      .filter(b => b.status === "IN_PROGRESS")
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    return (
      <div className="booking-list-container">
        <h3>{title}</h3>

        <div className="booking-grid">

          {/* LEFT COLUMN → Chờ xử lý */}
          <div className="booking-column">
            {pending.length > 0 && (
              <h4 className="booking-group-title">Chờ xử lý</h4>
            )}
            {pending.map(booking => renderBookingItem(booking))}
          </div>

          {/* RIGHT COLUMN → Đang xử lý */}
          <div className="booking-column">
            {inProgress.length > 0 && (
              <h4 className="booking-group-title">Đang xử lý</h4>
            )}
            {inProgress.map(booking => renderBookingItem(booking))}
          </div>

        </div>
      </div>
    );
  }


  // ======================================================
  // 2️⃣ MODE = HISTORY → Completed | Declined + Cancelled
  // ======================================================
  const completed = bookings
    .filter(b => b.status === "COMPLETED")
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const rightStatuses = ["DECLINED", "CANCELLED"];

  const rightColumn = rightStatuses.flatMap(status =>
    bookings
      .filter(b => b.status === status)
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
      .map(b => ({ ...b, groupStatus: status }))
  );

  return (
    <div className="booking-list-container">
      <h3>{title}</h3>

      <div className="booking-grid">

        {/* LEFT COLUMN → Completed */}
        <div className="booking-column">
          {completed.length > 0 && (
            <h4 className="booking-group-title">Hoàn thành</h4>
          )}
          {completed.map(booking => renderBookingItem(booking))}
        </div>

        {/* RIGHT COLUMN → Declined + Cancelled */}
        <div className="booking-column">

          {rightColumn.map((booking, index) => {
            const showHeader =
              index === 0 || booking.groupStatus !== rightColumn[index - 1].groupStatus;

            return (
              <React.Fragment key={booking.bookingId}>
                {showHeader && (
                  <h4 className="booking-group-title">
                    {getStatusDisplay(booking.groupStatus).text}
                  </h4>
                )}

                {renderBookingItem(booking)}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </div>
  );
}
