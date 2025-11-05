import React, { useEffect, useState } from "react";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useParams, useNavigate } from "react-router-dom";
import "./CheckList.css";
import Button from '@components/ui/Button.jsx';
import { API_BASE_URL } from "@config/api.js";


export default function StaffCheckList() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = API_BASE_URL;
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const formatChecklistStatus = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'PENDING_APPROVAL': return 'Chờ duyệt cuối';
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return status || 'Chưa rõ';
    }
  };
  const formatTechStatus = (status) => {
    switch (status) {
      case 'GOOD': return 'Tốt';
      case 'ADJUSTMENT': return 'Hiệu chỉnh';
      case 'REPAIR': return 'Sửa chữa';
      case 'REPLACE': return 'Thay thế';
      case 'PENDING': return 'Chờ kiểm tra';
      default: return status || 'Chưa rõ';
    }
  };
  const formatApprovalStatus = (status) => {
    switch (status) {
      case 'APPROVED': return '✓ Đã duyệt';
      case 'DECLINED': return '✗ Từ chối';
      case 'PENDING': return 'Chờ duyệt';
      default: return status || 'Chờ duyệt';
    }
  };
  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/staff/checklist/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error(`Lỗi: ${response.status}`);
        const data = await response.json();
        setChecklist(data);
      } catch (err) {
        console.error("Lỗi khi tải checklist:", err);
        setError("Không thể tải checklist.");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchChecklist();
  }, [bookingId, API_BASE, token]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;
  if (!checklist) return <p>Không tìm thấy checklist cho booking #{bookingId}</p>;

  return (
    <div className="page-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <div className="content">
        {/* HEADER */}
        <div className="header-bar">
          <h2>Biên bản kiểm tra - Booking #{bookingId}</h2>
          <Button className="back-button-header" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
        </div>

        {/* THÔNG TIN TỔNG QUAN */}
        <div className="overview-section">
          <h3>THÔNG TIN TỔNG QUAN</h3>
          <div className="overview-grid">
            <p><strong>Gói bảo dưỡng:</strong> {checklist.planName}</p>
            <p><strong>Kỹ thuật viên:</strong> {checklist.technicianName}</p>
            <p><strong>Trạng thái:</strong> {formatChecklistStatus(checklist.status)}</p>
            <p><strong>Xe:</strong> {checklist.vehicleModel} - {checklist.vehicleNumberPlate}</p>
            <p><strong>Số KM hiện tại:</strong> {checklist.currentKm?.toLocaleString()} km</p>
            <p><strong>KM bảo dưỡng:</strong> {checklist.maintenanceKm?.toLocaleString()} km</p>
            <p><strong>Tổng chi phí dự kiến:</strong> {checklist.estimatedCost?.toLocaleString()} VND</p>
            <p><strong>Được duyệt:</strong> {checklist.totalCostApproved?.toLocaleString()} VND</p>
            <p><strong>Từ chối:</strong> {checklist.totalCostDeclined?.toLocaleString()} VND</p>
          </div>
        </div>

        {/* BẢNG CHI TIẾT CHECKLIST */}
        <table className="checklist-table">
          <thead>
            <tr>
              <th>Hạng mục</th>
              <th>Loại thao tác</th>
              <th>Trạng thái</th>
              <th>Phụ tùng</th>
              <th>Phê duyệt KH</th>
              <th>Chi phí (VND)</th>
              <th>Ghi chú KH</th>
            </tr>
          </thead>
          <tbody>
            {checklist.details?.map((detail, idx) => (
              <tr
                key={idx}
                className={
                  detail.approvalStatus === "APPROVED"
                    ? "row-approved"
                    : ""
                }
              >
                <td>{detail.itemName}</td>
                <td>{detail.actionType}</td>
                <td>{formatTechStatus(detail.status)}</td>
                <td>{detail.partName || "—"}</td>
                <td>
                  <span className={`approval-status approval-${detail.approvalStatus?.toLowerCase() || "pending"}`}>
                    {formatApprovalStatus(detail.approvalStatus)}
                  </span>
                </td>
                <td className="cost-cell">
                  {(detail.laborCost + detail.materialCost).toLocaleString("vi-VN")}
                </td>
                <td>{detail.customerNote || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
