import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './Modal.css';


export default function ConfirmModal({ visible, message, onClose, onConfirm, loading }) {
  if (!visible) return null;
  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content confirm-modal customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-body">
          <FaExclamationTriangle className="confirm-icon" />
          <h3>Xác nhận hành động</h3>
          <p>{message}</p>
        </div>
        <div className="form-actions">
          <Button onClick={onClose} className="btn-cancel" disabled={loading}>Hủy bỏ</Button>
          <Button onClick={onConfirm} className="btn-confirm-danger" disabled={loading}>{loading ? 'Đang xử lý...' : 'Xác nhận'}</Button>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}
