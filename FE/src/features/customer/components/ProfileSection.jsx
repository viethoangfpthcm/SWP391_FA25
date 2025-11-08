import React from 'react';
import { FaUser, FaEdit } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import './ProfileSection.css';

export default function ProfileSection({ customerInfo, onEdit }) {
  return (
    <section className="dashboard-section profile-section">
      <div className="profile-header">
        <h2><FaUser /> Thông tin cá nhân</h2>
        <Button className="edit-profile-btn" onClick={onEdit} title="Cập nhật thông tin">
          <FaEdit /> Tùy chỉnh
        </Button>
      </div>

      {customerInfo ? (
        <div className="profile-details">
          <p><strong>Họ và tên:</strong> {customerInfo.fullName}</p>
          <p><strong>Email:</strong> {customerInfo.email}</p>
          <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
        </div>
      ) : (
        <p>Không có thông tin khách hàng.</p>
      )}
    </section>
  );
}
