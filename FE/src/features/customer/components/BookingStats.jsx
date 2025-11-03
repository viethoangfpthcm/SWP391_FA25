import React from "react";
import Button from "@components/ui/Button.jsx";
import { FaCalendarAlt, FaTimes, FaStar } from "react-icons/fa";

const STATUS_MAP = {
  PENDING: { text: "Chờ xử lý", class: "pending" },
  APPROVED: { text: "Đã duyệt", class: "approved" },
  ASSIGNED: { text: "Đã gán thợ", class: "assigned" },
  IN_PROGRESS: { text: "Đang xử lý", class: "in_progress" },
  COMPLETED: { text: "Hoàn thành", class: "completed" },
  PAID: { text: "Đã thanh toán", class: "paid" },
  CANCELLED: { text: "Đã hủy", class: "cancelled" },
  DECLINED: { text: "Đã từ chối", class: "declined" },
};

function BookingStats({ bookings = [], onCancel, onFeedback }) {
  const active = bookings.filter(b => ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(b.status));
  const history = bookings.filter(b => ["COMPLETED", "PAID", "CANCELLED", "DECLINED"].includes(b.status));

  return (
    <section className="dashboard-section booking-stats-section">
      <h2><FaCalendarAlt /> Lịch sử & Thống kê Lịch hẹn</h2>

      <div className="booking-list-container">
        <h3>Lịch hẹn đang xử lý</h3>
        {active.length > 0 ? (
          <div className="booking-list">
            {active.map((b) => (
              <div key={b.bookingId} className={`booking-item status-${STATUS_MAP[b.status]?.class}`}>
                <div className="booking-item-header">
                  <strong>{b.vehiclePlate}</strong> ({b.vehicleModel})
                  <span className={`booking-status status-label-${STATUS_MAP[b.status]?.class}`}>
                    {STATUS_MAP[b.status]?.text}
                  </span>
                </div>
                <p><strong>Trung tâm:</strong> {b.centerName}</p>
                <p><strong>Ngày hẹn:</strong> {new Date(b.bookingDate).toLocaleString("vi-VN")}</p>
                {b.note && <p><strong>Ghi chú:</strong> {b.note}</p>}
                {b.status === "PENDING" && (
                  <Button className="btn-cancel-small" onClick={() => onCancel(b.bookingId)}>
                    <FaTimes /> Hủy
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Không có lịch hẹn nào đang xử lý.</p>
        )}
      </div>

      <div className="booking-list-container">
        <h3>Lịch sử hẹn</h3>
        {history.length > 0 ? (
          <div className="booking-list">
            {history.map((b) => (
              <div key={b.bookingId} className={`booking-item status-${STATUS_MAP[b.status]?.class}`}>
                <div className="booking-item-header">
                  <strong>{b.vehiclePlate}</strong> ({b.vehicleModel})
                  <span className={`booking-status status-label-${STATUS_MAP[b.status]?.class}`}>
                    {STATUS_MAP[b.status]?.text}
                  </span>
                </div>
                <p><strong>Trung tâm:</strong> {b.centerName}</p>
                <p><strong>Ngày hẹn:</strong> {new Date(b.bookingDate).toLocaleString("vi-VN")}</p>
                {(b.status === "COMPLETED" || b.status === "PAID") && (
                  <Button className="btn-feedback" onClick={() => onFeedback(b.bookingId)}>
                    <FaStar /> {b.hasFeedback ? "Sửa đánh giá" : "Đánh giá"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có lịch sử hẹn nào.</p>
        )}
      </div>
    </section>
  );
}

export default BookingStats;
