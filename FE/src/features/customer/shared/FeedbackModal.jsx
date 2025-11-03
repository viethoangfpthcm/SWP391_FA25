import React, { useEffect, useState } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { API_BASE } from "@config/api.js";

function FeedbackModal({ bookingId, onClose, onSuccess }) {
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/feedback/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.rating) {
            setFeedbackData({
              rating: data.rating,
              comment: data.comment || "",
            });
          }
        }
      } catch (err) {
        console.error("Fetch feedback error:", err);
      }
    };
    if (bookingId) {
      loadFeedback();
    }
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!feedbackData.rating || feedbackData.rating === 0 || feedbackData.rating === "0") {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }
    
    if (!feedbackData.comment || feedbackData.comment.trim() === "") {
      setError("Vui lòng nhập bình luận của bạn");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bookingId: Number(bookingId),
        rating: Number(feedbackData.rating),
        comment: feedbackData.comment.trim(),
      };
      
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
      }
      
      await response.json();
      onSuccess();
    } catch (err) {
      console.error("Feedback submit error:", err);
      setError(err.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay feedback-modal">
      <div className="modal-container">
        <h2>Đánh giá dịch vụ</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ
        </p>
        
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Đánh giá của bạn <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                style={{
                  fontSize: '40px',
                  cursor: 'pointer',
                  color: star <= feedbackData.rating ? '#fbbf24' : '#d1d5db',
                  marginRight: '8px',
                  transition: 'all 0.2s',
                }}
              >
                ★
              </span>
            ))}
          </div>

          <label>
            Bình luận (tùy chọn)
          </label>
          <textarea
            placeholder="Xin thật sự..."
            value={feedbackData.comment}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, comment: e.target.value })
            }
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <div className="modal-buttons" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Button type="submit" disabled={loading || !feedbackData.rating}>
              {loading ? <Loading inline /> : "Gửi đánh giá"}
            </Button>
            <Button className="btn-cancel" onClick={onClose} type="button" disabled={loading}>
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
