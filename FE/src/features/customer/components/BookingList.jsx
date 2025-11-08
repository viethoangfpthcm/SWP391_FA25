import React from 'react';
import Button from '@components/ui/Button.jsx';
import { FaTimes, FaStar } from 'react-icons/fa';
import './BookingList.css';

export default function BookingList({ title, bookings, loading, getStatusDisplay, onCancel, onFeedback }) {
  return (
    <div className="booking-list-container">
      <h3>{title}</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : bookings.length > 0 ? (
        <div className="booking-list">
          {bookings.map(booking => (
            <div key={booking.bookingId} className={`booking-item status-${getStatusDisplay(booking.status).className}`}>
              <div className="booking-item-header">
                <strong>{booking.vehiclePlate}</strong> ({booking.vehicleModel})
                <span className={`booking-status status-label-${getStatusDisplay(booking.status).className}`}>
                  {getStatusDisplay(booking.status).text}
                </span>
              </div>
              <p><strong>Trung tâm:</strong> {booking.centerName}</p>
              <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
              {booking.note && <p className="booking-note"><strong>Ghi chú:</strong> {booking.note}</p>}
              {onCancel && booking.status === 'PENDING' && (
                <Button className="btn-cancel-small" onClick={() => onCancel(booking.bookingId)} title="Hủy lịch hẹn này"><FaTimes /> Hủy</Button>
              )}
              {onFeedback && (booking.status === 'COMPLETED' || booking.status === 'PAID') && (
                <Button className="btn-feedback" onClick={() => onFeedback(booking.bookingId)} title="Đánh giá dịch vụ"><FaStar /> {booking.hasFeedback ? 'Sửa đánh giá' : 'Đánh giá'}</Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>{title.includes('đang xử lý') ? 'Không có lịch hẹn nào đang xử lý.' : 'Chưa có lịch sử hẹn nào.'}</p>
      )}
    </div>
  );
}
