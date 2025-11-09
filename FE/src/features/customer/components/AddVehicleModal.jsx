import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './BookingFormModal.css';
import './Modal.css';


export default function AddVehicleModal({
  visible,
  onClose,
  newVehicleData,
  onChange,
  onSave,
  loading,
  error,
  vehicleModels,
  loadingModels,
}) {
  if (!visible) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
  <div className="modal-content booking-form-modal add-vehicle-form customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm xe mới</h2>
          <Button onClick={onClose} className="close-modal-btn">
            <FaTimes />
          </Button>
        </div>
        <form onSubmit={onSave}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="licensePlate">Biển số xe *</label>
            <input className="customer-input" type="text" id="licensePlate" name="licensePlate" value={newVehicleData.licensePlate} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="model">Dòng xe (Model) *</label>
            <select className="customer-input" id="model" name="model" value={newVehicleData.model} onChange={onChange} required disabled={loadingModels}>
              <option value="" disabled>
                {loadingModels ? "Đang tải..." : `-- Chọn dòng xe (${vehicleModels.length} xe) --`}
              </option>
              {vehicleModels.map(modelName => (
                <option key={modelName} value={modelName}>{modelName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="year">Năm sản xuất *</label>
            <input className="customer-input" type="number" id="year" name="year" value={newVehicleData.year} onChange={onChange} required min="1900" max={new Date().getFullYear() + 1} />
          </div>
          <div className="form-group">
            <label htmlFor="purchaseDate">Ngày mua *</label>
            <input className="customer-input" type="date" id="purchaseDate" name="purchaseDate" value={newVehicleData.purchaseDate} onChange={onChange} required max={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label htmlFor="currentKm">Số KM hiện tại</label>
            <input className="customer-input" type="number" id="currentKm" name="currentKm" value={newVehicleData.currentKm} onChange={onChange} min="0" />
          </div>

          <div className="form-actions">
            <Button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>Hủy</Button>
            <Button type="submit" className="btn-save" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu xe'}</Button>
          </div>
        </form>
        </div>
      </div>
    </ModalPortal>
  );
}
