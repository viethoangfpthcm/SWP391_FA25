// ConfirmationModal.jsx
import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import Button from './Button.jsx';
import './ConfirmationModal.css'; // Optional extra styles — global styles handle most

function ConfirmationModal({ show, message, onConfirm, onCancel, isLoading }) {
  if (!show) return null;

  return (
    <div className="modal-overlay confirmation-overlay">
      <div className="confirmation-modal">
        {/* Header với gradient */}
        <div className="confirmation-header">
          <div className="confirmation-icon">
            <FaExclamationTriangle />
          </div>
          <h3>Xác nhận hành động</h3>
        </div>

        {/* Body */}
        <div className="confirmation-body">
          <p>{message}</p>
        </div>

        {/* Footer với các nút */}
        <div className="confirmation-footer">
          <Button className="btn-cancel" onClick={onCancel} disabled={isLoading}>
            <FaTimes /> Hủy bỏ
          </Button>
          <Button className="btn-confirm btn-danger" onClick={onConfirm} loading={isLoading}>
            {isLoading ? 'Đang xử lý...' : (<><FaCheck /> Xác nhận</>)}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;