import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import "./Payment.css";

export default function PaymentProcess() {
  const { id } = useParams(); // bookingId từ URL
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Tải thông tin chi tiết booking cần thanh toán
  useEffect(() => {
    const fetchPaymentDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token) {
          alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
          navigate("/login");
          return;
        }

        const res = await fetch(
          `http://localhost:8080/api/customer/bookings?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
            },
          }
        );

        if (res.status === 401) {
          alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          setError(`Không thể tải thông tin đơn hàng (mã lỗi: ${res.status})`);
          return;
        }

        const data = await res.json();
        const booking = data.find((b) => b.bookingId === Number(id));

        if (!booking) {
          setError("Không tìm thấy đơn hàng.");
          return;
        }

        // 👇 Giả sử amount chưa có, tạm gán giá trị mẫu
        setPayment({
          ...booking,
          amount: booking.amount || 500000,
        });
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối đến server!");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetail();
  }, [id, navigate]);

  // 🧾 Xử lý thanh toán
  const handlePayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Bạn chưa đăng nhập hoặc token không tồn tại!");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `http://localhost:8080/api/payment/process?bookingId=${id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: 0,
            paymentDate: new Date().toISOString(),
            laborCost: 0,
            materialCost: 0,
            totalAmount: payment?.amount || 0,
            status: "PENDING",
            note: "Thanh toán qua React",
          }),
        }
      );

      // 🧩 Kiểm tra lỗi thường gặp
      if (res.status === 401) {
        alert("Thanh toán thất bại (mã lỗi: 401 — Token hết hạn hoặc không hợp lệ)");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        alert(`Thanh toán thất bại (mã lỗi: ${res.status})`);
        return;
      }

      // ✅ Nếu thành công
      alert("Thanh toán thành công!");
      navigate("/payment/ready");

    } catch (err) {
      alert("Lỗi kết nối đến server!");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // 🎨 Giao diện hiển thị
  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payment-container">
      <h1 className="payment-title">Quá trình thanh toán</h1>

      <div className="payment-detail">
        <h3>{payment.vehicleModel || "Không rõ xe"}</h3>
        <p>Biển số xe: {payment.vehiclePlate || "Không rõ"}</p>
        <p>Trung tâm: {payment.centerName || "Không rõ trung tâm"}</p>
        <p>Địa chỉ: {payment.centerAddress || "Không rõ địa chỉ"}</p>
        <p>Số tiền: {payment.amount?.toLocaleString()} VND</p>
        <p>Trạng thái: {payment.status || "Chờ thanh toán"}</p>
      </div>

      <button
        className="btn-pay"
        onClick={handlePayment}
        disabled={processing}
      >
        {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
}
