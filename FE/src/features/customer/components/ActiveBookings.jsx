import React from 'react';
import Button from '@components/ui/Button.jsx';
import { FaTimes } from 'react-icons/fa';
import './ActiveBookings.css';

const BOOKING_STATUS_MAP = {
  PENDING: { text: 'Chờ xử lý', className: 'pending' },
  APPROVED: { text: 'Đã duyệt', className: 'approved' },
  ASSIGNED: { text: 'Đã giao xe kỹ thuật viên', className: 'assigned' },
  IN_PROGRESS: { text: 'Đang xử lý', className: 'in-progress' },
  COMPLETED: { text: 'Hoàn thành', className: 'completed' },
  PAID: { text: 'Đã thanh toán', className: 'paid' },
  CANCELLED: { text: 'Đã hủy', className: 'cancelled' },
  DECLINED: { text: 'Đã từ chối', className: 'declined' },
  DEFAULT: { text: 'Không rõ', className: 'default' }
};


export default function ActiveBookings({ bookings, onCancel, loading }) {
  const getStatusDisplay = (status) => {
    return BOOKING_STATUS_MAP[status] || { text: status || 'Không rõ', className: 'default' };
  };

  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="active-bookings-section">
      <h2>Lịch hẹn đang xử lý</h2>
      {bookings.map(booking => {
        const statusDisplay = getStatusDisplay(booking.status);

        return (
          <div key={booking.bookingId} className={`active-booking-item status-${(booking.status || '').toLowerCase()}`}>
            <p><strong>Trung tâm:</strong> {booking.centerName}</p>
            <p><strong>Địa chỉ:</strong> {booking.centerAddress}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
            <p><strong>Trạng thái:</strong> {statusDisplay.text}</p>

            {booking.status === 'PENDING' && (
              <Button onClick={() => onCancel(booking.bookingId)} className="btn-cancel" disabled={loading}><FaTimes /> Hủy lịch hẹn</Button>
            )}
          </div>
        );
      })}
    </div>
  );
}