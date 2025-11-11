import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './Modal.css';

export default function SuccessModal({ visible, message, onClose, onAction }) {
  if (!visible) return null;
  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-body">
          <FaCheckCircle className="success-icon" />
          <p>{message}</p>
        </div>
        <div className="form-actions">
          <Button onClick={() => { onClose(); if (onAction) onAction(); }} className="btn-save">OK</Button>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}
