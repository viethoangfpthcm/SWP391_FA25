import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';

/**
 * Nút thanh toán VNPay — bản ổn định, không xổ, giao diện đồng bộ trang Report
 */
export default function VnPayPaymentButton({ bookingId, totalAmount, className = '', onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = 'https://103.90.226.216:8443';

  // ✅ Xử lý redirect về từ VNPay
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get('vnp_ResponseCode');
    if (responseCode === '00') {
      if (onSuccess) onSuccess();
      navigate(location.pathname, { replace: true });
    } else if (responseCode) {
      setError('Thanh toán thất bại. Vui lòng thử lại.');
      setTimeout(() => setError(''), 3000);
    }
  }, [location, navigate, onSuccess]);

  // ✅ Xử lý click thanh toán
  const handlePayment = async () => {
    if (!token) {
      setError('Vui lòng đăng nhập để thanh toán.');
      navigate('/');
      return;
    }

    if (!bookingId) {
      setError('Không tìm thấy mã booking.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/payment/create-vnpay-payment/${bookingId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Phiên đăng nhập hết hạn.');
          localStorage.clear();
          navigate('/');
          return;
        }
        const text = await response.text();
        throw new Error(text || 'Lỗi khi tạo thanh toán.');
      }

      const data = await response.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // chuyển hướng đến VNPay
      } else {
        throw new Error('Không nhận được URL thanh toán từ máy chủ.');
      }
    } catch (err) {
      console.error('Lỗi thanh toán:', err);
      setError(err.message);
      setTimeout(() => setError(''), 3000);
      setLoading(false);
    }
  };

  return (
    <div className={`vnpay-payment-section ${className}`}>
      <div className="payment-summary">
        <h4>Tổng chi phí đã duyệt : &nbsp;&nbsp;</h4 >
        <span className="total-amount">
          {(totalAmount || 0).toLocaleString('vi-VN')} đ
        </span>
      </div>

      <div className="btn-container">
        <button
          onClick={handlePayment}
          disabled={loading || !totalAmount || totalAmount === 0}
          className={`btn-pay-vnpay`}
        >
          <FaCreditCard className="icon" />
          <span>Thanh toán ngay với VNPay</span>
        </button>

        {/* ✅ Overlay loading nằm tách riêng, không đẩy layout */}
        {loading && (
          <div className="fixed-overlay">
            <div className="loading-box">
              <FaSpinner className="spinner-icon" />
              <span>Đang xử lý...</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="payment-error-message">⚠ {error}</p>}

      <style jsx>{`
      .vnpay-payment-section {
        width: 100%;
        font-family: "Segoe UI", sans-serif;
        position: relative;
      }

      .payment-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .payment-summary h4 {
        margin: 0;
        font-size: 1rem;
        color: #fff;
        font-weight: 500;
      }

      .total-amount {
        font-size: 1.1rem;
        font-weight: 700;
        color: #ffffffff;
      }

      .btn-container {
        position: relative;
      }

      .btn-pay-vnpay {
        width: 100%;
        height: 48px;
        font-size: 1rem;
        font-weight: 600;
        color: #e4d5d5ff;
        background: #d44a4aff;
        border: 1px solid #060606ff;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.25s ease;
      }

      .btn-pay-vnpay:hover:not(:disabled) {
        background: #438854ff;
        transform: translateY(-1px);
      }

      .btn-pay-vnpay:disabled {
        background: #aaa;
        color: #333;
        cursor: not-allowed;
      }

      /* ✅ overlay loading tách khỏi layout, tuyệt đối toàn màn hình */
.fixed-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35); /* mờ nền tối, dịu mắt hơn */
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease;
}

.loading-box {
  background: rgba(255, 255, 255, 0.92);
  padding: 18px 26px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  color: #222;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
  animation: popIn 0.25s ease;
}

.spinner-icon {
  font-size: 1.3rem;
  color: #007bff;
  animation: pulse 1.4s ease-in-out infinite; /* 👈 hiệu ứng mới */
}

/* 💫 Hiệu ứng pulse nhẹ nhàng */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
  }
}

/* ✨ Hiệu ứng xuất hiện mượt */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ✨ Loading box nhẹ nhàng nổi lên */
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}


      .payment-error-message {
        color: #ff8080;
        font-size: 0.9rem;
        margin-top: 10px;
        text-align: center;
      }

      
    `}</style>
    </div>
  );

}
