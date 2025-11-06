import React, { useState } from "react";
import Button from "@components/ui/Button.jsx";
import { API_BASE_URL } from "@config/api.js";
import { FaTimes, FaBox } from "react-icons/fa";
import "./RestockRequestModal.css";

export default function RestockRequestModal({ part, onClose }) {
  const [quantity, setQuantity] = useState(50);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập gửi yêu cầu nhập hàng (có thể cần API endpoint riêng)
    try {
      // TODO: Gọi API để tạo yêu cầu nhập hàng
      // const response = await fetch("/api/manager/restock-request", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      //   body: JSON.stringify({
      //     partId: part.id,
      //     quantity,
      //     note,
      //   }),
      // });

      // Giả lập delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating restock request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content restock-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-message">
            <FaBox size={48} color="#4caf50" />
            <h3>Yêu cầu nhập hàng đã được gửi!</h3>
            <p>Phụ tùng: <strong>{part.name}</strong></p>
            <p>Số lượng: <strong>{quantity}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content restock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaBox /> Yêu cầu nhập hàng
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="restock-info">
          <div className="info-row">
            <span className="info-label">Phụ tùng:</span>
            <span className="info-value">{part.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tồn kho hiện tại:</span>
            <span className={`info-value ${part.quantity === 0 ? "text-danger" : "text-warning"}`}>
              {part.quantity} (⚠️ {part.quantity === 0 ? "Hết hàng" : "Sắp hết"})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="restock-form">
          <div className="form-group">
            <label>
              Số lượng cần nhập <span className="required">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              required
              placeholder="Nhập số lượng cần đặt hàng"
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm về yêu cầu nhập hàng (nếu có)..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="btn-submit"
              loading={loading}
              disabled={loading}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
