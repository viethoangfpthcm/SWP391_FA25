import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import "./Payment.css";

export default function PaymentProcess() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    // useEffect(() => {
    //     const fetchPaymentDetail = async () => {
    //         try {
    //             const token = localStorage.getItem("token");
    //             const bookingId = parseInt(id, 10);
    //
    //             if (!token) {
    //                 setError("Bạn chưa đăng nhập hoặc token hết hạn!");
    //                 navigate("/login");
    //                 return;
    //             }
    //
    //             const res = await fetch(`http://localhost:8080/api/customer/customerBookings/${bookingId}`, {
    //                 method: "GET",
    //                 headers: {
    //                     "Authorization": `Bearer ${token}`,
    //                     "Accept": "application/json",
    //                 },
    //             });
    //
    //             if (res.status === 401) {
    //                 setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
    //                 navigate("/login");
    //                 return;
    //             }
    //
    //             if (res.status === 403) {
    //                 setError("Bạn không có quyền truy cập thông tin đơn hàng này!");
    //                 return;
    //             }
    //
    //             if (!res.ok) {
    //                 setError(`Lỗi máy chủ: ${res.status}`);
    //                 return;
    //             }
    //
    //             const contentType = res.headers.get("content-type");
    //             if (contentType && contentType.includes("application/json")) {
    //                 const data = await res.json();
    //                 setPayment(data);
    //             } else {
    //                 setError("Phản hồi từ server không phải JSON hợp lệ!");
    //             }
    //         } catch (err) {
    //             console.error("Lỗi khi tải chi tiết thanh toán:", err);
    //             setError("Lỗi kết nối đến server!");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchPaymentDetail();
    // }, [id, navigate]);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Bạn chưa đăng nhập!");
                navigate("/login");
                return;
            }

            const res = await fetch(`https://103.90.226.216:8443/api/payment/process?bookingId=${id}`, {
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
            });

            if (res.ok) {
                alert("Thanh toán thành công!");
                navigate("/payment/ready");
            } else if (res.status === 401) {
                alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                navigate("/login");
            } else if (res.status === 403) {
                alert("Tài khoản không có quyền thực hiện hành động này!");
            } else {
                alert(`Thanh toán thất bại (mã lỗi: ${res.status})`);
            }
        } catch (err) {
            console.error("Lỗi khi thanh toán:", err);
            alert("Lỗi kết nối server!");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

    if (error) return <div className="error">{error}</div>;

    if (!payment) return <div className="empty">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="payment-container">
            <h1 className="payment-title">Quá trình thanh toán</h1>

            <div className="payment-detail">
                <h3>{payment.serviceName || "Dịch vụ không xác định"}</h3>
                <p>Khách hàng: {payment.customerName || "Không rõ"}</p>
                <p>Số tiền: {Number(payment.amount || 0).toLocaleString()} VND</p>
                <p>Trạng thái: {payment.status || "Không rõ"}</p>
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
