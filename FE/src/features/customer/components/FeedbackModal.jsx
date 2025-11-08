import React, { useEffect } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import ModalPortal from '@components/ui/ModalPortal.jsx';
import './Modal.css';
import './FeedbackModal.css';

export default function FeedbackModal({
  visible, onClose, data, onChange, onRatingChange, onSubmit, loading, error
}) {
  if (!visible) return null;

  const stop = (e) => e.stopPropagation();

  // Đóng bằng ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content feedback-modal" onClick={stop}>
          <div className="modal-header">
            <h2>Đánh giá dịch vụ</h2>
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              className="close-modal-btn"
            >
              <FaTimes />
            </Button>
          </div>

          <form onSubmit={onSubmit} onClick={stop}>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group rating-group">
              <label>Đánh giá của bạn *</label>
              <div className="stars">
                {[1,2,3,4,5].map(star => (
                  <FaStar
                    key={star}
                    className={star <= data.rating ? 'star-selected' : 'star-empty'}
                    onClick={() => onRatingChange(star)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Bình luận (tùy chọn)</label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={data.comment}
                onChange={onChange}
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose?.(); }}
                className="btn-cancel"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
