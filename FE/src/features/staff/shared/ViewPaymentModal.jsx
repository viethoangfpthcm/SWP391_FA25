import React, { useState, useEffect } from "react";
import { FaTimes, FaDollarSign } from "react-icons/fa";
import Loading from "@components/ui/Loading.jsx";
import Button from "@components/ui/Button.jsx";
import "./ViewPaymentModal.css";

const ViewPaymentModal = ({ bookingId, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchPayment();
    }
  }, [bookingId]);

  const fetchPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/staff/payments/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải thông tin thanh toán");
      }

      const data = await response.json();
      setPayment(data);
    } catch (err) {
      console.error("Error fetching payment:", err);
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thông tin thanh toán</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <Loading />
              <p>Đang tải thông tin thanh toán...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : payment ? (
            <div className="payment-content">
              <div className="payment-header-section">
                <div className="payment-id">
                  <span className="label">Mã thanh toán:</span>
                  <span className="payment-id-value">#{payment.paymentId}</span>
                </div>
                <div className="payment-status">
                  <span className={`status-badge status-${payment.status?.toLowerCase()}`}>
                    {payment.status || "N/A"}
                  </span>
                </div>
              </div>

              <div className="payment-info">
                <div className="info-row">
                  <span className="label">Booking ID:</span>
                  <span className="value">#{payment.bookingId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{payment.customerName || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Trung tâm:</span>
                  <span className="value">{payment.centerName || "N/A"}</span>
                </div>
              </div>

              <div className="payment-amounts">
                <div className="amount-row">
                  <span className="label">Chi phí nhân công:</span>
                  <span className="amount">{formatCurrency(payment.laborCost)}</span>
                </div>
                <div className="amount-row">
                  <span className="label">Chi phí phụ tùng:</span>
                  <span className="amount">{formatCurrency(payment.materialCost)}</span>
                </div>
                <div className="amount-row total">
                  <span className="label">Tổng cộng:</span>
                  <span className="amount total-amount">
                    {formatCurrency(payment.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="payment-method">
                <span className="label">Phương thức:</span>
                <span className="method-badge">
                  {payment.paymentMethod || "N/A"}
                </span>
              </div>

              <div className="payment-date">
                <span className="label">Ngày thanh toán:</span>
                <span className="value">
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleString("vi-VN")
                    : "Chưa thanh toán"}
                </span>
              </div>

              {payment.note && (
                <div className="payment-note">
                  <span className="label">Ghi chú:</span>
                  <p className="note-text">{payment.note}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Chưa có thông tin thanh toán cho booking này</p>
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

export default ViewPaymentModal;
