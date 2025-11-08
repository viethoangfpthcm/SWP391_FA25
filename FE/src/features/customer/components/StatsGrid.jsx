import React from 'react';
import './StatsGrid.css';
export default function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-item">
        <span className="stat-value">{stats.totalBookings || 0}</span>
        <span className="stat-label">Tổng lịch hẹn</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.pendingBookings || 0}</span>
        <span className="stat-label">Chờ xử lý</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.approvedBookings || 0}</span>
        <span className="stat-label">Đã duyệt</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.assignedBookings || 0}</span>
        <span className="stat-label">Đã gán thợ</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.inProgressBookings || 0}</span>
        <span className="stat-label">Đang xử lý</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.completedBookings || 0}</span>
        <span className="stat-label">Đã hoàn thành</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.paidBookings || 0}</span>
        <span className="stat-label">Đã thanh toán</span>
      </div>
      <div className="stat-item wide">
        <span className="stat-label">Lịch hẹn gần nhất:</span>
        <span className="stat-value small">
          {stats.lastBookingDate ? new Date(stats.lastBookingDate).toLocaleString('vi-VN') : 'Chưa có'}
        </span>
      </div>
    </div>
  );
}
