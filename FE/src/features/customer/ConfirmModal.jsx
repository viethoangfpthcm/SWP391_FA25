import React from "react";
import Button from "@components/ui/Button.jsx";

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Xác nhận</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <Button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            Đồng ý
          </Button>
          <Button className="btn-cancel" onClick={onClose}>
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}

// ✅ Export default đúng chuẩn (Vite nhận được)
export default ConfirmModal;
