import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './ConfirmationModal.css';

export default function ConfirmModal({
  visible,
  message,
  onClose,
  onConfirm,
  loading,
  requireReason = false,
  onReasonChange
}) {
  const [reason, setReason] = useState("");

  if (!visible) return null;

  const handleConfirmClick = () => {
    if (requireReason && !reason.trim()) {
      alert("Vui lòng nhập lý do trước khi xác nhận.");
      return;
    }
    onConfirm(reason);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (onReasonChange) onReasonChange(e.target.value);
  };

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content confirm-modal customer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="confirm-modal-body">
            <FaExclamationTriangle className="confirm-icon" />
            <h3>Xác nhận hành động</h3>
            <p>{message}</p>

            {requireReason && (
              <textarea
                className="reason-input"
                placeholder="Nhập lý do từ chối..."
                value={reason}
                onChange={handleReasonChange}
                disabled={loading}
                rows={3}
              />
            )}
          </div>

          <div className="form-actions">
            <Button onClick={onClose} className="btn-cancel" disabled={loading}>Hủy bỏ</Button>
            <Button onClick={handleConfirmClick} className="btn-confirm-danger" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
