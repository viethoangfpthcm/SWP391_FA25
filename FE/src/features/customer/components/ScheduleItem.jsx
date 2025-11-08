import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaLock } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import './ScheduleItem.css';

const getStatusIcon = (status) => {
  switch (status) {
    case 'ON_TIME': return <FaCheckCircle className="status-icon on-time" title="Đã hoàn thành" />;
    case 'EXPIRED': return <FaExclamationTriangle className="status-icon expired" title="Đã bỏ qua" />;
    case 'NEXT_TIME': return <FaCalendarAlt className="status-icon next-time" title="Lượt bảo dưỡng tiếp theo" />;
    case 'LOCKED': return <FaLock className="status-icon locked" title="Cần hoàn thành lần trước" />;
    case 'OVERDUE': return <FaExclamationTriangle className="status-icon overdue" title="Quá hạn bảo dưỡng" />;
    default: return null;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'ON_TIME': return 'Đã hoàn thành';
    case 'EXPIRED': return 'Đã bỏ qua';
    case 'NEXT_TIME': return 'Có thể đặt lịch';
    case 'LOCKED': return 'Chưa thể đặt lịch';
    case 'OVERDUE': return 'Đã quá hạn';
    default: return 'Không xác định';
  }
};

export default function ScheduleItem({ item, nextTimePlanId, hasActiveBooking, onBookClick }) {
  return (
    <div key={item.maintenancePlanId} className={`schedule-item status-${item.status?.toLowerCase()}`}>
      <div className="schedule-item-header">
        <h3>{item.planName}</h3>
        <div className="status-container">
          {getStatusIcon(item.status)}
          <span className="status-label">{getStatusLabel(item.status)}</span>
        </div>
      </div>
      <p className="description">{item.description || 'Không có mô tả chi tiết.'}</p>
      <p><strong>Mốc KM:</strong> {item.intervalKm?.toLocaleString()} km</p>
      {item.planDate && <p><strong>Ngày dự kiến:</strong> {new Date(item.planDate).toLocaleDateString('vi-VN')}</p>}
      {item.deadline && <p><strong>Hạn chót:</strong> {new Date(item.deadline).toLocaleDateString('vi-VN')}</p>}

      {item.status === 'EXPIRED' && <p className="expired-info"><FaExclamationTriangle /> Lần bảo dưỡng này đã bị bỏ qua</p>}
      {item.status === 'LOCKED' && <p className="locked-message"><FaLock /> Cần hoàn thành lần bảo dưỡng kế tiếp trước</p>}
      {item.status === 'OVERDUE' && <p className="overdue-info"><FaExclamationTriangle /> Lịch bảo dưỡng này đã quá hạn!</p>}

      {(item.status === 'NEXT_TIME' || item.status === 'OVERDUE') && item.maintenancePlanId === nextTimePlanId && (
        hasActiveBooking ? (
          <p className="locked-message" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            Xe này đã có lịch hẹn (Chờ xử lý hoặc chưa thanh toán).
          </p>
        ) : (
          <Button className="book-now-button" onClick={() => onBookClick(item)}>
            <FaCalendarAlt /> Đặt lịch ngay
          </Button>
        )
      )}

      {item.status === 'ON_TIME' && <div className="completed-badge"><FaCheckCircle /> Đã hoàn thành</div>}
    </div>
  );
}
