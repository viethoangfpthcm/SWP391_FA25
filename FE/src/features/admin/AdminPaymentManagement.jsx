import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaSpinner,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminPaymentManagement.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Loading from "@components/ui/Loading.jsx";
import { API_BASE_URL } from "@config/api.js";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";

if (import.meta.env.MODE !== "development") {
}

export default function AdminPaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("all");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // --- Lấy thông tin user ---
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
      const data = await res.json();
      localStorage.setItem("fullName", data.fullName || "Admin");
      localStorage.setItem("role", data.role || "Admin");
      setUserInfo({ fullName: data.fullName, role: data.role });
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin người dùng.");
    }
  };

  // --- Lấy danh sách trung tâm ---
  const fetchCenters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách trung tâm");
      const data = await res.json();
      setCenters(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Lấy danh sách thanh toán ---
  const fetchPayments = async () => {
    try {
      setLoading(true);
      let endpoint;

      if (selectedCenter === "all" || !selectedCenter) {
        endpoint = `${API_BASE_URL}/api/admin/payments`;
      } else {
        endpoint = `${API_BASE_URL}/api/admin/payments/by-center/${selectedCenter}`;
      }
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        console.warn("⚠️ Không có quyền truy cập API thanh toán này.");
        setError("Bạn không có quyền truy cập dữ liệu này.");
        return;
      }

      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect ---
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUserInfo();
    fetchCenters();
  }, [token, navigate]);

  useEffect(() => {
    fetchPayments();
  }, [selectedCenter]);

  // --- Helper format ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const getStatusClass = (status) =>
    status ? `role-${status.toLowerCase()}` : "role-cancelled";

  const filteredPayments =
    filterStatus === "all"
      ? payments
      : payments.filter(
          (p) => p.status?.toLowerCase() === filterStatus.toLowerCase()
        );

  // --- Loading UI ---
  if (showLoading) {
    return (
      <Loading text="Đang tải hóa đơn..." />
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
      <main className="main-content payment-page">
        <header className="page-header">
          <h1>
            <FaCreditCard /> Quản lý Thanh toán
          </h1>
          <p>Xem và theo dõi tất cả thanh toán trong hệ thống.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="actions-bar">
          <div className="filter-group">
            <label htmlFor="statusFilter">
              <FaFilter /> Lọc trạng thái:
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="centerFilter">
              <FaFilter /> Trung tâm:
            </label>
            <select
              id="centerFilter"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option key="all" value="all">
                Tất cả trung tâm
              </option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Tên khách hàng</th>
                  <th>Trung tâm</th>
                  <th>Ngày thanh toán</th>
                  <th>Phương thức</th>
                  <th>Chi phí nhân công</th>
                  <th>Chi phí phụ tùng</th>
                  <th>Phí đặt chỗ</th>
                  <th>Tổng cộng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      <Loading inline /> Đang tải...
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.paymentId}>
                      <td>#{payment.paymentId}</td>
                      <td>{payment.customerName || "N/A"}</td>
                      <td>{payment.centerName || "N/A"}</td>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.paymentMethod || "N/A"}</td>
                      <td>{formatCurrency(payment.laborCost)}</td>
                      <td>{formatCurrency(payment.materialCost)}</td>
                      <td>{formatCurrency(payment.bookingFee)}</td>
                      <td>
                        <strong>{formatCurrency(payment.totalAmount)}</strong>
                      </td>
                      <td>
                        <span
                          className={`role-badge ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      Không có dữ liệu thanh toán.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
