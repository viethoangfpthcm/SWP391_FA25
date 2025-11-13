import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@config/api.js";
import Loading from "@components/ui/Loading.jsx";
import Sidebar from "@components/layout/Sidebar.jsx";
import { FaMoneyBillWave, FaCheck, FaTimes } from "react-icons/fa";
import "./PaymentManagement.css";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const showLoading = useMinimumDelay(loading, 1000);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/payment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: "Chờ thanh toán", className: "payment-pending", icon: <FaTimes /> },
      PAID: { text: "Đã thanh toán", className: "payment-paid", icon: <FaCheck /> },
      REFUNDED: { text: "Đã hoàn tiền", className: "payment-refunded", icon: <FaCheck /> },
    };
    return badges[status] || { text: status, className: "payment-default", icon: null };
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === "all") return true;
    return payment.status === filterStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => {
      const total = (p.laborCost || 0) + (p.materialCost || 0) + (p.bookingFee || 0);
      return sum + total;
    }, 0);

  if (showLoading) {
    return (
      <Loading text="Đang tải hóa đơn..." />
    );
  }

  return (
    <div className="admin-dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={localStorage.getItem("fullName")}
        userRole={localStorage.getItem("role")}
      />
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>
            <FaMoneyBillWave /> Quản lý thanh toán
          </h1>
          <p className="subtitle">Theo dõi doanh thu và giao dịch</p>
        </header>

        <div className="admin-content">
          <div className="payment-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaMoneyBillWave />
              </div>
              <div className="stat-info">
                <p className="stat-label-payment">Tổng doanh thu</p>
                <h3 className="stat-value-payment">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalRevenue)}
                </h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <FaCheck />
              </div>
              <div className="stat-info">
                <p className="stat-label-payment">Đã thanh toán</p>
                <h3 className="stat-value-payment">
                  {payments.filter((p) => p.status === "PAID").length}
                </h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <FaTimes />
              </div>
              <div className="stat-info">
                <p className="stat-label-payment">Chờ thanh toán</p>
                <h3 className="stat-value-payment">
                  {payments.filter((p) => p.status === "PENDING").length}
                </h3>
              </div>
            </div>
          </div>

          <div className="payment-filters">
            <label>Trạng thái:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="no-payments">
              <FaMoneyBillWave size={48} />
              <p>Không có giao dịch nào</p>
            </div>
          ) : (
            <div className="payment-table-container">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Booking ID</th>
                    <th>Khách hàng</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Ngày thanh toán</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const badge = getStatusBadge(payment.status);
                    const totalAmount = payment.totalAmount;
                    return (
                      <tr key={payment.paymentId}>
                        <td>{payment.paymentId}</td>
                        <td>{payment.bookingId}</td>
                        <td>{payment.customerName || "N/A"}</td>
                        <td className="payment-amount">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(totalAmount)}
                        </td>
                        <td>{payment.paymentMethod || "VNPay"}</td>
                        <td>
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleString("vi-VN")
                            : "N/A"}
                        </td>
                        <td>
                          <span className={`payment-badge ${badge.className}`}>
                            {badge.icon} {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
