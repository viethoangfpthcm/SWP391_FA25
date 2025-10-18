import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "./Payment.css";

export default function PaymentReady() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8080/api/customer/payments/ready", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Lỗi tải dữ liệu (mã ${res.status})`);
        }

        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải danh sách thanh toán từ máy chủ!");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [navigate]);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payment-container">
      <h1 className="payment-title">Danh sách dịch vụ chờ thanh toán</h1>

      {payments.length === 0 ? (
        <p className="empty">Không có đơn hàng nào cần thanh toán.</p>
      ) : (
        <div className="payment-list">
          {payments.map((item) => (
            <div key={item.bookingId} className="payment-card">
              <h3>{item.centerName || "Trung tâm không xác định"}</h3>
              <p>Xe: {item.vehicleModel || "Không rõ"} - {item.vehiclePlate || "Không rõ"}</p>
              <p>Địa chỉ: {item.centerAddress || "Không có thông tin"}</p>
              <p>
                Ngày đặt:{" "}
                {item.bookingDate
                  ? new Date(item.bookingDate).toLocaleString("vi-VN")
                  : "Không rõ"}
              </p>
              <p>Trạng thái: {item.status || "Không rõ"}</p>
              <p>Ghi chú: {item.note || "Không có"}</p>
              {/* Số tiền không có trong API /ready, nên nếu cần hiển thị thì phải truyền từ nơi khác */}
              <p>
                Số tiền:{" "}
                {item.amount ? Number(item.amount).toLocaleString() + " VND" : "—"}
              </p>

              <button
                className="btn-pay"
                onClick={() => navigate(`/payment/process/${item.bookingId}`)}
              >
                Thanh toán
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
