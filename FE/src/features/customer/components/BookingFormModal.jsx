import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './Modal.css';
import './BookingFormModal.css';

export default function BookingFormModal({ visible, selectedPlan, formData, onChange, onConfirm, centers, loading, error, onClose, licensePlate }) {
  if (!visible || !selectedPlan) return null;
  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
  <div className="modal-content booking-form-modal customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đặt lịch cho: {selectedPlan.planName}</h2>
          <Button onClick={onClose} className="close-modal-btn"> <FaTimes /> </Button>
        </div>
        <form onSubmit={onConfirm}>
          {error && <p className="error-message">{error}</p>}
          <p className="booking-info">Xe: <strong className="booking-info-value">{licensePlate}</strong></p>
          <p className="booking-info">Gói: <strong className="booking-info-value">{selectedPlan.planName}</strong> ({selectedPlan.intervalKm?.toLocaleString()} km)</p>
          <div className="form-group">
            <label  htmlFor="centerId">Chọn trung tâm *</label>
            <select className="customer-input" id="centerId" name="centerId" value={formData.centerId} onChange={onChange} required>
              <option value="" disabled>-- Chọn trung tâm dịch vụ --</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>{center.name} - {center.address}</option>
              ))}
            </select>
          </div>
          <div className="form-group inline-group">
            <div>
              <label htmlFor="bookingDate">Chọn ngày *</label>
              <input className="customer-input" type="date" id="bookingDate" name="bookingDate" value={formData.bookingDate} onChange={onChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label htmlFor="bookingTime">Chọn giờ *</label>
              <input className="customer-input" type="time" id="bookingTime" name="bookingTime" value={formData.bookingTime} onChange={onChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="note">Ghi chú (Tùy chọn)</label>
            <input className="customer-input" type="text" id="note" name="note" value={formData.note} onChange={onChange} placeholder="Yêu cầu thêm (nếu có)..." />
          </div>
          <div className="form-actions">
            <Button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>Hủy</Button>
            <Button type="submit" className="btn-save" disabled={loading}>{loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}</Button>
          </div>
        </form>
        </div>
      </div>
    </ModalPortal>
  );
}
