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
import Loading from '@components/ui/Loading.jsx';
import { API_BASE_URL } from "@config/api.js";

if (import.meta.env.MODE !== "development") {
}

export default function AdminPaymentManagement() {
    const [payments, setPayments] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState("all");

    const navigate = useNavigate();
    
    const token = localStorage.getItem("token");

    // --- L?y th�ng tin user ---
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
            if (!res.ok) throw new Error("Kh�ng th? t?i th�ng tin ngu?i d�ng");
            const data = await res.json();
            localStorage.setItem("fullName", data.fullName || "Admin");
            localStorage.setItem("role", data.role || "Admin");
            setUserInfo({ fullName: data.fullName, role: data.role });
        } catch (err) {
            console.error(err);
            setError("Kh�ng th? t?i th�ng tin ngu?i d�ng.");
        }
    };

    // --- L?y danh s�ch trung t�m ---
    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Kh�ng th? t?i danh s�ch trung t�m");
            const data = await res.json();
            setCenters(data);
        } catch (e) {
            console.error(e);
        }
    };

    // --- L?y danh s�ch thanh to�n ---
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
                console.warn("?? Kh�ng c� quy?n truy c?p API thanh to�n n�y.");
                setError("B?n kh�ng c� quy?n truy c?p d? li?u n�y.");
                return;
            }

            const data = await res.json();
            setPayments(data);
        } catch (err) {
            console.error(err);
            setError("Kh�ng th? t?i danh s�ch thanh to�n.");
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
const formatCurrency= (amount) => {
  if (!amount) return "0 VN�";
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + " T?";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + " Tri?u";
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + "K";
  return amount + " VN�";
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
    if (loading && !userInfo) {
        return (
            <div className="dashboard-container">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <Loading inline />
                    <p>�ang t?i d? li?u thanh to�n...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
            <main className="main-content">
                <header className="page-header">
                    <h1>
                        <FaCreditCard /> Qu?n l� Thanh to�n
                    </h1>
                    <p>Xem v� theo d�i t?t c? thanh to�n trong h? th?ng.</p>
                </header>

                {error && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                <div className="actions-bar">
                    <div className="filter-group">
                        <label htmlFor="statusFilter">
                            <FaFilter /> L?c tr?ng th�i:
                        </label>
                        <select
                            id="statusFilter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">T?t c?</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="centerFilter">
                            <FaFilter /> Trung t�m:
                        </label>
                        <select
                            id="centerFilter"
                            value={selectedCenter} // li�n k?t v?i state
                            onChange={(e) => setSelectedCenter(e.target.value)} // c?p nh?t state
                        >
                            <option key="all" value="all">T?t c? trung t�m</option>
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
                                    <th>Booking ID</th>
                                    <th>Trung t�m</th>
                                    <th>Ng�y thanh to�n</th>
                                    <th>Phuong th?c</th>
                                    <th>Chi ph� (Lao d?ng)</th>
                                    <th>Chi ph� (V?t tu)</th>
                                    <th>T?ng c?ng</th>
                                    <th>Tr?ng th�i</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="empty-state">
                                            <Loading inline /> �ang t?i...
                                        </td>
                                    </tr>
                                ) : filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId}>
                                            <td>#{payment.paymentId}</td>
                                            <td>#{payment.bookingId}</td>
                                            <td>{payment.centerName || "N/A"}</td>
                                            <td>{formatDate(payment.paymentDate)}</td>
                                            <td>{payment.paymentMethod || "N/A"}</td>
                                            <td>{formatCurrency(payment.laborCost)}</td>
                                            <td>{formatCurrency(payment.materialCost)}</td>
                                            <td>
                                                <strong>
                                                    {formatCurrency(payment.totalAmount)}
                                                </strong>
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
                                        <td colSpan="9" className="empty-state">
                                            Kh�ng c� d? li?u thanh to�n.
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
