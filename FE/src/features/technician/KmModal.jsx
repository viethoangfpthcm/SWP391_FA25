import React from "react";
import Button from "@components/ui/Button.jsx";

export default function KmModal({ actualKm, setActualKm, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Nhập số KM hiện tại của xe</h3>
        <input
          type="number"
          placeholder="Nhập Actual KM..."
          value={actualKm}
          onChange={(e) => {
            if (e.target.value === "" || parseFloat(e.target.value) >= 0) setActualKm(e.target.value);
          }}
          min="0"
          style={{
            backgroundColor: actualKm ? "#e8f7e4" : "white",
            border: `1px solid ${actualKm ? "#28a745" : "#ccc"}`,
            padding: "8px",
            borderRadius: "6px",
          }}
        />
        <div className="modal-buttons">
          <Button onClick={onConfirm} className="confirm-btn">Xác nhận</Button>
          <Button onClick={onCancel} className="cancel-btn">Hủy</Button>
        </div>
      </div>
    </div>
  );
}
