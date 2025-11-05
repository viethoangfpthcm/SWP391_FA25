import React, { useState, useEffect } from "react";
import {
    FaSpinner,
    FaExclamationTriangle,
    FaArrowLeft,
    FaClipboardList,
    FaFileInvoiceDollar,
    FaTools,
    FaCar,
    FaUser,
} from "react-icons/fa";
// Import file CSS M?I
import "./AdminChecklistDetail.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import { API_BASE_URL } from "@config/api.js";


if (import.meta.env.MODE !== "development") {
}

export default function AdminChecklistDetail() {
    const [checklistData, setChecklistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const navigate = useNavigate();
    // L?y bookingId t? URL
    const { bookingId } = useParams();

    const API_BASE = API_BASE_URL;
    const token = localStorage.getItem("token");

    // 1. Fetch th�ng tin user (cho Sidebar)
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            if (!res.ok) throw new Error("Kh�ng th? t?i th�ng tin ngu?i d�ng");
            const data = await res.json();
            setUserInfo({
                fullName: data.fullName || "Admin",
                role: data.role || "Admin"
            });
        } catch (err) {
            console.error(err);
            // Kh�ng set l?i ? d�y d? uu ti�n l?i t?i checklist
        }
    };

    // 2. Fetch chi ti?t checklist (API m?i)
    const fetchChecklistDetail = async () => {
        if (!bookingId) {
            setError("Kh�ng t�m th?y Booking ID.");
            setLoading(false);
            return;
        }
        try {
            setError(null);
            setLoading(true);
            const url = `${API_BASE}/api/admin/checklists/booking/${bookingId}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Kh�ng t�m th?y checklist cho booking n�y. C� th? n� chua du?c b?t d?u.");
                }
                throw new Error(`L?i t?i chi ti?t checklist (${res.status})`);
            }

            const data = await res.json();
            setChecklistData(data);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. useEffect d? g?i API
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchUserInfo();
        fetchChecklistDetail();
    }, [token, navigate, bookingId]);

    // 4. Helpers
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const options = {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit",
            };
            return new Date(dateString).toLocaleString("vi-VN", options);
        } catch (error) {
            return dateString;
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "role-na";

        let formattedStatus = status.toLowerCase();

        formattedStatus = formattedStatus.replace(/-/g, " ");
        formattedStatus = formattedStatus.replace(/_/g, "-");

        return `role-${formattedStatus}`;
    };


    // Helper m?i d? d?nh d?ng ti?n t?
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0 ?";
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleGoBack = () => {
        navigate(-1); // Quay l?i trang tru?c d�
    };

    // 5. Tr?ng th�i Loading
    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <Loading inline />
                    <p>�ang t?i chi ti?t checklist...</p>
                </main>
            </div>
        );
    }

    // 6. Render n?i dung
    return (
        <div className="dashboard-container">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />

            <main className="main-content">
                <header className="page-header">
                    <div className="page-header-top">
                        <h1>
                            <FaClipboardList /> Chi ti?t Checklist
                        </h1>
                        <Button className="action-button back-button" onClick={handleGoBack}>
                            <FaArrowLeft /> Quay l?i
                        </Button>
                    </div>
                    <p>Booking ID: #{bookingId}</p>
                </header>

                {error && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* Ch? hi?n th? n?u kh�ng c� l?i V� c� data */}
                {!error && checklistData && (
                    <>
                        {/* --- KH?I TH�NG TIN CHUNG --- */}
                        <div className="info-card">
                            <h2 className="card-title"><FaCar /> Th�ng tin B?o du?ng</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <strong>Bi?n s? xe:</strong>
                                    <span>{checklistData.vehicleNumberPlate || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <strong>D�ng xe:</strong>
                                    <span>{checklistData.vehicleModel || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <strong>Tr?ng th�i:</strong>
                                    <span>
                                        <span className={`role-badge ${getStatusClass(checklistData.status)}`}>
                                            {checklistData.status || "N/A"}
                                        </span>
                                    </span>
                                </div>
                                <div className="info-item">
                                    <strong>G�i b?o du?ng:</strong>
                                    <span>{checklistData.planName || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <strong>M?c KM g�i:</strong>
                                    <span>{checklistData.maintenanceKm ? `${checklistData.maintenanceKm} km` : "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <strong>KM Th?c t?:</strong>
                                    <span>{checklistData.currentKm ? `${checklistData.currentKm} km` : "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- KH?I CHI PH� --- */}
                        <div className="info-card">
                            <h2 className="card-title"><FaFileInvoiceDollar /> T?ng quan Chi ph�</h2>
                            <div className="info-grid cost-grid">
                                <div className="info-item cost-estimated">
                                    <strong>T?ng T?m t�nh:</strong>
                                    <span>{formatCurrency(checklistData.estimatedCost)}</span>
                                </div>
                                <div className="info-item cost-approved">
                                    <strong>�� duy?t:</strong>
                                    <span>{formatCurrency(checklistData.totalCostApproved)}</span>
                                </div>
                                <div className="info-item cost-declined">
                                    <strong>�� t? ch?i:</strong>
                                    <span>{formatCurrency(checklistData.totalCostDeclined)}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- B?NG CHI TI?T H?NG M?C --- */}
                        <div className="info-card">
                            <h2 className="card-title"><FaTools /> Chi ti?t H?ng m?c</h2>
                        </div>
                        <div className="table-card">
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>H?ng m?c</th>
                                            <th>H�nh d?ng</th>
                                            <th>Tr?ng th�i (KTV)</th>
                                            <th>Tr?ng th�i (KH)</th>
                                            <th>Linh ki?n</th>
                                            <th>Chi ph� L�</th>
                                            <th>Chi ph� VT</th>
                                            <th>Ghi ch� (KTV)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {checklistData.details && checklistData.details.length > 0 ? (
                                            checklistData.details.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.itemName || "N/A"}</td>
                                                    <td>{item.actionType || "N/A"}</td>
                                                    <td>
                                                        <span className={`role-badge ${getStatusClass(item.status)}`}>
                                                            {item.status ? item.status.replace(/_/g, " ") : "N/a"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`role-badge ${getStatusClass(item.approvalStatus)}`}>
                                                            {item.approvalStatus || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td>{item.partName || "N/A"}</td>
                                                    <td>{formatCurrency(item.laborCost)}</td>
                                                    <td>{formatCurrency(item.materialCost)}</td>
                                                    <td title={item.note}>{item.note || "N/A"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="empty-state">
                                                    Kh�ng c� h?ng m?c chi ti?t n�o.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}