import React, { useEffect, useState } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";

function FeedbackModal({ bookingId, onClose, onSuccess }) {
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);
  const API_BASE = "";

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/feedback/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data)
            setFeedbackData({
              rating: data.rating,
              comment: data.comment,
            });
        }
      } catch (err) {
        console.error("Fetch feedback error:", err);
      }
    };
    loadFeedback();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/feedback/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });
      if (!response.ok) throw new Error("Lỗi gửi feedback");
      onSuccess();
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay feedback-modal">
      <div className="modal-container">
        <h2>Đánh giá lịch hẹn</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Chấm điểm:</label>
          <select
            value={feedbackData.rating}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, rating: e.target.value })
            }
          >
            <option value="0">-- Chọn --</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} sao
              </option>
            ))}
          </select>

          <textarea
            placeholder="Nhận xét của bạn..."
            value={feedbackData.comment}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, comment: e.target.value })
            }
          />

          <div className="modal-buttons">
            <Button type="submit" disabled={loading}>
              {loading ? <Loading inline /> : "Gửi đánh giá"}
            </Button>
            <Button className="btn-cancel" onClick={onClose} type="button">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ Export default đặt cuối (chuẩn convention)
export default FeedbackModal;
