import React from "react";
import { FaCircleCheck } from "react-icons/fa6";

export default function SuccessModal({ message, onClose }) {
  return (
    <div className="modal-overlay success-modal">
      <div className="modal-container">
        <FaCircleCheck size={48} color="green" />
        <h2>Thành công</h2>
        <p>{message}</p>
        <button className="btn-close" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
