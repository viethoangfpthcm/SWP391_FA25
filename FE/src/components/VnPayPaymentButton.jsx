import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // THÊM: Để xử lý query params và navigation
import { FaSpinner, FaCreditCard } from 'react-icons/fa';

/**
 * Component Nút Thanh Toán VNPay Tái Sử Dụng
 * @param {object} props
 * @param {number} props.bookingId - ID của booking cần thanh toán
 * @param {number} props.totalAmount - Tổng số tiền (để hiển thị)
 * @param {string} [props.className] - Class CSS tùy chỉnh (nếu cần)
 * @param {function} [props.onSuccess] - Callback khi thanh toán thành công
 */
export default function VnPayPaymentButton({ bookingId, totalAmount, className = '', onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // THÊM: Để điều hướng nếu token không hợp lệ
  const location = useLocation(); // THÊM: Để đọc query params
  const API_BASE = "https://103.90.226.216:8443";

  // THÊM: Kiểm tra query params từ VNPay sau khi redirect về
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get('vnp_ResponseCode');
    if (responseCode === '00') { // Mã thành công của VNPay
      if (onSuccess) {
        onSuccess(); // Gọi callback từ Report1.jsx
      }
      // Xóa query params để tránh lặp lại
      navigate(location.pathname, { replace: true });
    } else if (responseCode) {
      setError('Thanh toán thất bại. Vui lòng thử lại.');
      setTimeout(() => setError(''), 3000); // Xóa lỗi sau 3s
    }
  }, [location, navigate, onSuccess]);

  const handlePayment = async () => {
    if (!token) {
      setError("Vui lòng đăng nhập để thanh toán.");
      navigate("/"); // Chuyển hướng về trang đăng nhập
      return;
    }

    if (!bookingId) {
      setError("Không tìm thấy mã booking.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/payment/create-vnpay-payment/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn.");
          localStorage.clear();
          navigate("/");
          return;
        }
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'Lỗi khi tạo thanh toán.');
        } catch (e) {
          throw new Error(errorText || 'Lỗi khi tạo thanh toán.');
        }
      }

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // Chuyển hướng đến VNPay
      } else {
        throw new Error('Không nhận được URL thanh toán từ máy chủ.');
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      setError(err.message);
      setTimeout(() => setError(''), 3000); // THÊM: Xóa lỗi sau 3s
      setLoading(false);
    }
  };

  return (
    <div className={`vnpay-payment-section ${className}`}>
      {/* Phần tóm tắt chi phí */}
      <div className="payment-summary">
        <h4>Tổng chi phí đã duyệt:</h4>
        <span className="total-amount">
          {(totalAmount || 0).toLocaleString('vi-VN')} đ
        </span>
      </div>

      {/* Nút thanh toán */}
      <button
        onClick={handlePayment}
        disabled={loading || !totalAmount || totalAmount === 0}
        className={`btn-pay-vnpay ${className}`}
        aria-label={`Thanh toán ${totalAmount.toLocaleString('vi-VN')} đ với VNPay`}
      >
        {loading ? (
          <FaSpinner className="spinner-icon" />
        ) : (
          <FaCreditCard style={{ marginRight: '8px' }} />
        )}
        {loading ? 'Đang xử lý...' : 'Thanh toán ngay với VNPay'}
      </button>

      {/* Thông báo lỗi (nếu có) */}
      {error && (
        <p className="payment-error-message" role="alert">
          Lỗi: {error}
        </p>
      )}

      <style jsx>{`
        .vnpay-payment-section {
          width: 100%;
          font-family: Arial, sans-serif;
        }
        .payment-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .payment-summary h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }
        .total-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #dc3545;
        }
        .btn-pay-vnpay {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background-color: #28a745; /* ĐỔI: Dùng màu xanh lá từ report1.css */
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
        .btn-pay-vnpay:hover:not(:disabled) {
          background-color: #218838;
        }
        .btn-pay-vnpay:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .payment-error-message {
          color: #dc3545;
          font-size: 0.9rem;
          margin-top: 10px;
          text-align: center;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}