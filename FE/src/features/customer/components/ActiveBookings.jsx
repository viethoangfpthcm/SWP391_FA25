import React from 'react';
import Button from '@components/ui/Button.jsx';
import { FaTimes } from 'react-icons/fa';
import './ActiveBookings.css';

export default function ActiveBookings({ bookings, onCancel, loading }) {
  if (!bookings || bookings.length === 0) return null;
  return (
    <div className="active-bookings-section">
      <h2>Lịch hẹn đang xử lý</h2>
      {bookings.map(booking => (
        <div key={booking.bookingId} className={`active-booking-item status-${(booking.status || '').toLowerCase()}`}>
          <p><strong>Trung tâm:</strong> {booking.centerName}</p>
          <p><strong>Địa chỉ:</strong> {booking.centerAddress}</p>
          <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
          <p><strong>Trạng thái:</strong> {booking.status}</p>
          {booking.status === 'PENDING' && (
            <Button onClick={() => onCancel(booking.bookingId)} className="btn-cancel" disabled={loading}><FaTimes /> Hủy lịch hẹn</Button>
          )}
        </div>
      ))}
    </div>
  );
}
