// ConfirmationModal.jsx
import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import './ConfirmationModal.css'; // We'll add CSS later

function ConfirmationModal({ show, message, onConfirm, onCancel, isLoading }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay confirmation-overlay">
      <div className="modal confirmation-modal">
        <div className="confirmation-icon">
          <FaExclamationTriangle />
        </div>
        <div className="confirmation-content">
          <h3>Xác nhận hành động</h3>
          <p>{message}</p>
        </div>
        <div className="confirmation-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            <FaTimes /> Hủy bỏ
          </button>
          <button
            className="btn-confirm btn-danger" // Added btn-danger for delete
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="spinner-icon spin-inline" /> : <FaCheck />}
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;