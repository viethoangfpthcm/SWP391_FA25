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
import "./AdminChecklistDetail.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { API_BASE_URL } from "@config/api.js";

if (import.meta.env.MODE !== "development") {
}

export default function AdminChecklistDetail() {
  const [checklistData, setChecklistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();
  const { bookingId } = useParams();

  const token = localStorage.getItem("token");

  // 1. Fetch thông tin user (cho Sidebar)
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
      setUserInfo({
        fullName: data.fullName || "Admin",
        role: data.role || "Admin",
      });
    } catch (err) {
      console.error(err);
      // Không set lại ở đây để ưu tiên lỗi tải checklist
    }
  };

  // 2. Fetch chi tiết checklist
  const fetchChecklistDetail = async () => {
    if (!bookingId) {
      setError("Không tìm thấy Booking ID.");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const url = `${API_BASE_URL}/api/admin/checklists/booking/${bookingId}`;

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
          throw new Error(
            "Không tìm thấy checklist cho booking này. Có thể nó chưa được bắt đầu."
          );
        }
        throw new Error(`Lỗi tải chi tiết checklist (${res.status})`);
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

  // 3. useEffect gọi API
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
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
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

  // Helper định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 5. Loading
  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
        <main className="main-content loading-state">
          <Loading inline />
          <p>Đang tải chi tiết checklist...</p>
        </main>
      </div>
    );
  }

  // 6. Render nội dung
  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />

      <main className="main-content">
        <header className="page-header">
          <div className="page-header-top">
            <h1>
              <FaClipboardList /> Chi tiết Checklist
            </h1>
            <Button className="action-button back-button" onClick={handleGoBack}>
              <FaArrowLeft /> Quay lại
            </Button>
          </div>
          <p>Booking ID: #{bookingId}</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!error && checklistData && (
          <>
            {/* --- KHỐI THÔNG TIN CHUNG --- */}
            <div className="info-card">
              <h2 className="card-title">
                <FaCar /> Thông tin Bảo dưỡng
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Biển số xe:</strong>
                  <span>{checklistData.vehicleNumberPlate || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Dòng xe:</strong>
                  <span>{checklistData.vehicleModel || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <span>
                    <span
                      className={`role-badge ${getStatusClass(
                        checklistData.status
                      )}`}
                    >
                      {checklistData.status || "N/A"}
                    </span>
                  </span>
                </div>
                <div className="info-item">
                  <strong>Gói bảo dưỡng:</strong>
                  <span>{checklistData.planName || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Mức KM gói:</strong>
                  <span>
                    {checklistData.maintenanceKm
                      ? `${checklistData.maintenanceKm} km`
                      : "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <strong>KM Thực tế:</strong>
                  <span>
                    {checklistData.currentKm
                      ? `${checklistData.currentKm} km`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* --- KHỐI CHI PHÍ --- */}
            <div className="info-card">
              <h2 className="card-title">
                <FaFileInvoiceDollar /> Tổng quan Chi phí
              </h2>
              <div className="info-grid cost-grid">
                <div className="info-item cost-estimated">
                  <strong>Tổng tạm tính:</strong>
                  <span>{formatCurrency(checklistData.estimatedCost)}</span>
                </div>
                <div className="info-item cost-approved">
                  <strong>Đã duyệt:</strong>
                  <span>{formatCurrency(checklistData.totalCostApproved)}</span>
                </div>
                <div className="info-item cost-declined">
                  <strong>Đã từ chối:</strong>
                  <span>{formatCurrency(checklistData.totalCostDeclined)}</span>
                </div>
              </div>
            </div>

            {/* --- BẢNG CHI TIẾT HẠNG MỤC --- */}
            <div className="info-card">
              <h2 className="card-title">
                <FaTools /> Chi tiết Hạng mục
              </h2>
            </div>
            <div className="table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Hành động</th>
                      <th>Trạng thái (KTV)</th>
                      <th>Trạng thái (KH)</th>
                      <th>Linh kiện</th>
                      <th>Chi phí LĐ</th>
                      <th>Chi phí VT</th>
                      <th>Ghi chú (KTV)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklistData.details && checklistData.details.length > 0 ? (
                      checklistData.details.map((item) => (
                        <tr key={item.id}>
                          <td>{item.itemName || "N/A"}</td>
                          <td>{item.actionType || "N/A"}</td>
                          <td>
                            <span
                              className={`role-badge ${getStatusClass(item.status)}`}
                            >
                              {item.status
                                ? item.status.replace(/_/g, " ")
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`role-badge ${getStatusClass(
                                item.approvalStatus
                              )}`}
                            >
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
                          Không có hạng mục chi tiết nào.
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
