import React from 'react';
import Button from '@components/ui/Button.jsx';
import { FaTimes, FaStar } from 'react-icons/fa';
import './BookingList.css';

const STATUS_PRIORITY = {
  PENDING: 1,
  IN_PROGRESS: 2,
  ASSIGNED: 3,
  APPROVED: 4,
  PAID: 5,
  COMPLETED: 6,
  CANCELLED: 7,
  DECLINED: 8
};

export default function BookingList({
  title,
  bookings,
  loading,
  getStatusDisplay,
  onCancel,
  onFeedback,
  mode = "history" // "processing" hoặc "history"
}) {
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  const normalizeStatusClass = (statusObj) => {
    if (!statusObj || !statusObj.className) return "pending";

    return statusObj.className
      .toLowerCase()
      .replace("-", "_");
  };

  // Hàm sắp xếp bookings theo thứ tự ưu tiên
  const sortBookingsByPriority = (bookingsArray) => {
    return [...bookingsArray].sort((a, b) => {
      // So sánh theo priority status trước
      const priorityA = STATUS_PRIORITY[a.status] || 999;
      const priorityB = STATUS_PRIORITY[b.status] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Nếu cùng priority, sắp xếp theo ngày (mới nhất lên đầu)
      return new Date(b.bookingDate) - new Date(a.bookingDate);
    });
  };

  // Hàm render booking item
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

  if (mode === "processing") {
    // Lọc các booking đang xử lý
    const activeStatuses = ["PENDING", "IN_PROGRESS", "ASSIGNED", "APPROVED", "PAID"];
    const activeBookings = bookings.filter(b => activeStatuses.includes(b.status));
    
    // Filter theo status được chọn
    const filteredBookings = selectedStatus === "ALL" 
      ? activeBookings 
      : activeBookings.filter(b => b.status === selectedStatus);
    
    // Sort theo priority
    const sortedBookings = sortBookingsByPriority(filteredBookings);

    // Lấy danh sách status có trong bookings
    const availableStatuses = [...new Set(activeBookings.map(b => b.status))];

    return (
      <div className="booking-list-container">
        <div className="booking-list-header">
          <h3>{title}</h3>
          <div className="status-filter">
            <label>Lọc theo trạng thái:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter-select"
            >
              <option value="ALL">Tất cả ({activeBookings.length})</option>
              {availableStatuses.sort((a, b) => (STATUS_PRIORITY[a] || 999) - (STATUS_PRIORITY[b] || 999)).map(status => (
                <option key={status} value={status}>
                  {getStatusDisplay(status).text} ({activeBookings.filter(b => b.status === status).length})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="booking-grid-auto">
          {sortedBookings.length > 0 ? (
            sortedBookings.map(booking => renderBookingItem(booking))
          ) : (
            <p className="no-bookings">Không có lịch hẹn nào với trạng thái này.</p>
          )}
        </div>
      </div>
    );
  }

  // Mode history - hiển thị tất cả theo priority
  // Filter theo status được chọn
  const filteredBookings = selectedStatus === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === selectedStatus);
  
  const sortedBookings = sortBookingsByPriority(filteredBookings);

  // Lấy danh sách status có trong bookings
  const availableStatuses = [...new Set(bookings.map(b => b.status))];

  return (
    <div className="booking-list-container">
      <div className="booking-list-header">
        <h3>{title}</h3>
        <div className="status-filter">
          <label>Lọc theo trạng thái:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter-select"
          >
            <option value="ALL">Tất cả ({bookings.length})</option>
            {availableStatuses.sort((a, b) => (STATUS_PRIORITY[a] || 999) - (STATUS_PRIORITY[b] || 999)).map(status => (
              <option key={status} value={status}>
                {getStatusDisplay(status).text} ({bookings.filter(b => b.status === status).length})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="booking-grid-auto">
        {sortedBookings.length > 0 ? (
          sortedBookings.map(booking => renderBookingItem(booking))
        ) : (
          <p className="no-bookings">Không có lịch hẹn nào với trạng thái này.</p>
        )}
      </div>
    </div>
  );
}