import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

export default function PaymentReady() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem("token"); // nếu có token lưu trong localStorage
                const res = await fetch("http://localhost:8080/api/customer/payments/ready", {
                    headers: {
                        "Authorization": token ? `Bearer ${token}` : "",
                        "Accept": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error("Không thể tải dữ liệu từ API");
                }

                const data = await res.json();
                setPayments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

    return (
        <div className="payment-container">
            <h1 className="payment-title">Danh sách dịch vụ chờ thanh toán</h1>

            {payments.length === 0 ? (
                <p className="empty">Không có đơn hàng nào cần thanh toán.</p>
            ) : (
                <div className="payment-list">
                    {payments.map((item) => (
                        <div key={item.bookingId || item.id} className="payment-card">
                            <h3>{item.centerName || "Trung tâm không xác định"}</h3>
                            <p>Xe: {item.vehicleModel || "Không rõ"} - {item.vehiclePlate || "Không rõ"}</p>
                            <p>Địa chỉ: {item.centerAddress || "Không có thông tin"}</p>
                            <p>Ngày đặt: {item.bookingDate ? new Date(item.bookingDate).toLocaleString() : "Không rõ"}</p>
                            <p>Trạng thái: {item.status || "Không rõ"}</p>
                            <p>Ghi chú: {item.note || "Không có"}</p>
                            <p>Số tiền: {Number(item.amount || 0).toLocaleString()} VND</p>

                            <button
                                className="btn-pay"
                                onClick={() => navigate(`/payment/process/${item.bookingId || item.id}`)}
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
