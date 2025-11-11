// src/features/customer/profile/ProfileModal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './Modal.css';
import './BookingFormModal.css';

export default function ProfileModal({
  visible,
  onClose,
  profileData,
  onChange,
  onSave,
  loading,
  error,
}) {
  if (!visible) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        {/* dùng booking-form-modal để kế thừa toàn bộ style kính mờ */}
        <div
          className="modal-content booking-form-modal customer-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Cập nhật thông tin</h2>
            <Button onClick={onClose} className="close-modal-btn">
              <FaTimes />
            </Button>
          </div>

          <form onSubmit={onSave} autoComplete="off" spellCheck={false}>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="customer-input"
                value={profileData.fullName}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="customer-input"
                value={profileData.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="customer-input"
                value={profileData.phone}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <input
                id="password"
                name="password"
                type="password"
                className="customer-input"
                value={profileData.password}
                onChange={onChange}
                placeholder="Để trống nếu không muốn đổi"
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
