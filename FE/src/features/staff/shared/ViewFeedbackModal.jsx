import React, { useState, useEffect } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import Loading from "@components/ui/Loading.jsx";
import Button from "@components/ui/Button.jsx";
import { API_BASE } from "@config/api.js";
import "./ViewFeedbackModal.css";

const ViewFeedbackModal = ({ bookingId, onClose }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchFeedback();
    }
  }, [bookingId]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE}/api/staff/feedback/${bookingId}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Bạn không có quyền xem feedback này.");
        }
        if (response.status === 404) {
          throw new Error("Khách hàng chưa gửi feedback cho booking này.");
        }
        throw new Error("Không thể tải feedback");
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star-filled" : "star-empty"}
      />
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Phản hồi của khách hàng</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <Loading />
              <p>Đang tải feedback...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : feedback ? (
            <div className="feedback-content">
              <div className="feedback-info">
                <div className="info-row">
                  <span className="label">Booking ID:</span>
                  <span className="value">#{feedback.bookingId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{feedback.userName || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Biển số:</span>
                  <span className="value">{feedback.licensePlate || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Trung tâm:</span>
                  <span className="value">{feedback.centerName || "N/A"}</span>
                </div>
              </div>

              <div className="rating-section">
                <span className="label">Đánh giá:</span>
                <div className="stars">{renderStars(feedback.rating || 0)}</div>
                <span className="rating-number">{feedback.rating || 0}/5</span>
              </div>

              <div className="comment-section">
                <span className="label">Nhận xét:</span>
                <p className="comment-text">
                  {feedback.comment || "Khách hàng chưa để lại nhận xét"}
                </p>
              </div>

              <div className="feedback-date">
                <span className="label">Ngày gửi:</span>
                <span className="value">
                  {feedback.feedbackDate
                    ? new Date(feedback.feedbackDate).toLocaleString("vi-VN")
                    : "N/A"}
                </span>
              </div>

              {feedback.isPublished && (
                <div className="published-badge">
                  ✓ Đã công khai
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Chưa có feedback cho booking này</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} className="btn-secondary">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewFeedbackModal;
