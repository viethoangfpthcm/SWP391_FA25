import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCalendarAlt, FaClipboardList, FaTimes } from "react-icons/fa";
import "./StaffDashboard.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import BookingFilters from "./shared/BookingFilters";
import BookingTable from "./shared/BookingTable";
import ViewFeedbackModal from "./shared/ViewFeedbackModal";
import ViewPaymentModal from "./shared/ViewPaymentModal";
import { API_BASE_URL } from "@config/api.js";
import ConfirmModal from "@components/ui/ConfirmationModal.jsx";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";


export default function StaffDashboard({ user, userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [requireReason, setRequireReason] = useState(false);

  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    // Kiểm tra token và tránh lỗi
    if (!token) {
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/account/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user info:", response.status);
        if (response.status === 401) {
          // Xử lý lỗi 401: đăng xuất
          localStorage.removeItem("token");
          localStorage.removeItem("fullName");
          localStorage.removeItem("role");
          navigate("/");
        }
        throw new Error("Không thể tải thông tin người dùng.");
      }

      const data = await response.json();
      const fetchedFullName = data.fullName || data.name || "N/A";
      const fetchedRole = data.role || "N/A";

      // LƯU VÀO LOCAL STORAGE
      localStorage.setItem('fullName', fetchedFullName);
      localStorage.setItem('role', fetchedRole);

      // CẬP NHẬT STATE
      setUserInfo({
        fullName: fetchedFullName,
        role: fetchedRole
      });
      setError(null);

    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(`Lỗi tải thông tin người dùng: ${err.message}`);
    }
  };

  const fetchAppointments = async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/staff/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Appointments API failed:", response.status, errorText);
        if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            navigate("/");
          }, 2000);
        } else {
          setError(`Không thể tải lịch hẹn (${response.status}): ${errorText}`);
        }
        setAppointments([]);
        return false;
      }

      const data = await response.json();
      // Sắp xếp cho booking mới nhất lên đầu
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) =>
        new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setAppointments(sortedData);
      return true;

    } catch (error) {
      console.error("❓ Error fetching appointments:", error);
      setError("Lỗi kết nối hoặc xử lý dữ liệu lịch hẹn.");
      setAppointments([]);
      return false;
    }
  };

  // Hàm fetch danh sách kỹ thuật viên
  const fetchTechnicians = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/staff/technicians`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Technicians API failed:", res.status, errorText);
        if (res.status === 401) {
          setError("Phiên đăng nhập hết hạn khi tải KTV.");
        } else {
          setError(`Không thể tải danh sách KTV (${res.status}): ${errorText}`);
        }
        setTechnicians([]);
        return false;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.warn("API trả về không phải mảng cho technicians, set rỗng.");
        setTechnicians([]);
        return true;
      }

      const mapped = data.map((t) => ({
        userId: String(t.userId || t.id || ""),
        fullName: t.fullName || t.name || "N/A",
        activeBookings: parseInt(t.activeBookings) || 0,
      }));
      setTechnicians(mapped);
      return true;

    } catch (err) {
      console.error(" Error fetching technicians:", err);
      setError("Lỗi kết nối hoặc xử lý dữ liệu kỹ thuật viên.");
      setTechnicians([]);
      return false;
    }
  };

  const fetchChecklist = async (bookingId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/checklist/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChecklist(data);
        setShowChecklistModal(true); // mở modal
      } else {
        alert("Không thể tải checklist. Có thể booking này chưa có checklist.");
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
      alert("Lỗi khi tải checklist!");
    } finally {
      setModalLoading(false);
    }
  };


  // Load data khi component được mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchUserInfo();
      // Chạy song song
      await Promise.allSettled([fetchAppointments(), fetchTechnicians()]);
      setLoading(false);
    };

    if (!token) {
      setError("Vui lòng đăng nhập để truy cập trang này.");
      setLoading(false);
      navigate("/");
      return;
    }
    loadData();
  }, [token, navigate]);

  // Xử lý khi chọn kỹ thuật viên
  const handleTechnicianChange = (bookingId, technicianId) => {
    setSelectedTechnicians((prev) => ({
      ...prev,
      [bookingId]: technicianId,
    }));
  };

  // Lấy tên kỹ thuật viên từ danh sách bằng userId
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return "—";
    const tech = technicians.find(t => String(t.userId) === String(technicianId));
    return tech ? tech.fullName : `KTV #${technicianId}`;
  };

  // Phê duyệt & phân công
  const handleAssign = async (bookingId) => {
    const technicianId = selectedTechnicians[bookingId];
    if (!technicianId) {
      setError("Vui lòng chọn một kỹ thuật viên để phân công.");
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/staff/bookings/assign-technician`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId: parseInt(bookingId), technicianId: parseInt(technicianId) }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Assignment API failed:", res.status, errorText);
        throw new Error(errorText || "Phân công thất bại.");
      }
      setSelectedTechnicians((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await fetchAppointments();
      await fetchTechnicians(); // Tải lại KTV để cập nhật số việc

    } catch (err) {
      console.error("❓ Error assigning technician:", err);
      setError(`Lỗi khi phân công: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/staff/bookings/${bookingId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Approve API failed:", res.status, errorText);

        if (res.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/"), 1500);
        } else {
          throw new Error(errorText || `Duyệt thất bại (${res.status})`);
        }
        return;
      }
      await fetchAppointments(); // Tải lại danh sách để cập nhật trạng thái

    } catch (err) {
      console.error(" Error approving booking:", err);
      setError(`Lỗi khi duyệt: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Từ chối
  const openDeclineModal = (bookingId) => {
    setRequireReason(true);
    setConfirmMessage("Nhập lý do từ chối lịch hẹn này:");
    setConfirmAction(() => async (reason) => {
      setActionLoading(bookingId);
      try {
        const url = `${API_BASE_URL}/api/staff/bookings/${bookingId}/decline?reason=${encodeURIComponent(reason)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text() || "Từ chối thất bại.");
        await fetchAppointments();
      } catch (err) {
        setError(`Lỗi khi từ chối: ${err.message}`);
      } finally {
        setActionLoading(null);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // *** BÀN GIAO XE ***
  const openHandoverModal = (bookingId) => {
    setRequireReason(false);
    setConfirmMessage("Xác nhận BÀN GIAO XE và hoàn tất booking này?");
    setConfirmAction(() => async () => {
      setActionLoading(bookingId);
      try {
        const url = `${API_BASE_URL}/api/staff/bookings/${bookingId}/handover`;
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text() || "Bàn giao thất bại.");
        await fetchAppointments();
      } catch (err) {
        setError(`Lỗi khi bàn giao: ${err.message}`);
      } finally {
        setActionLoading(null);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Staff có thể xem checklist ngay khi đã phân công
  const hasChecklist = (status) => {
    const statusText = status ? status.toLowerCase() : '';
    return ['assigned', 'in_progress', 'completed', 'paid'].includes(statusText);
  };

  const handleViewFeedback = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowFeedbackModal(true);
  };

  const handleViewPayment = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowPaymentModal(true);
  };

  const filteredAppointments = appointments.filter(appt =>
    statusFilter === 'all' || (appt.status && appt.status.toLowerCase() === statusFilter)
  );

  const statusOrder = [
    'pending',
    'approved',
    'assigned',
    'in_progress',
    'paid',
    'completed',
    'declined',
    'cancelled'
  ];

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const statusA = a.status?.toLowerCase().trim() || '';
    const statusB = b.status?.toLowerCase().trim() || '';

    const rankA = statusOrder.indexOf(statusA);
    const rankB = statusOrder.indexOf(statusB);

    const finalRankA = rankA === -1 ? Infinity : rankA;
    const finalRankB = rankB === -1 ? Infinity : rankB;

    if (finalRankA !== finalRankB) {
      return finalRankA - finalRankB;
    }

    return new Date(a.bookingDate) - new Date(b.bookingDate);
  });

  // --- Auto refresh danh sách lịch hẹn mỗi 30 giây ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, []);

  // --- Render ---
  if (showLoading) {
    return (
      <Loading text="Đang tải dữ liệu..." />
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="main-content staff-dashboard">
        <header className="page-header">
          <h1><FaCalendarAlt /> Quản lý lịch hẹn</h1>
          <p>Xem xét, phân công và theo dõi các lịch hẹn của khách hàng.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
            <Button onClick={() => setError(null)} className="clear-error-btn">&times;</Button>
          </div>
        )}

        <BookingFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <BookingTable
          bookings={sortedAppointments}
          loading={loading}
          error={error}
          statusFilter={statusFilter}
          technicians={technicians}
          selectedTechnicians={selectedTechnicians}
          actionLoading={actionLoading}
          onTechnicianChange={handleTechnicianChange}
          onApprove={handleApprove}
          onDecline={openDeclineModal}
          onAssign={handleAssign}
          onHandover={openHandoverModal}
          onViewChecklist={fetchChecklist}
          onViewFeedback={handleViewFeedback}
          onViewPayment={handleViewPayment}
        />
      </main>
      {showChecklistModal && (
        <div className="modal-overlay" onClick={() => setShowChecklistModal(false)}>
          <div
            className="modal-content modal-content-checklist"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2><FaClipboardList /> Chi tiết Checklist</h2>
              <button
                className="modal-close"
                onClick={() => setShowChecklistModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <Loading inline />
              ) : selectedChecklist ? (
                <div className="checklist-details">
                  <div className="checklist-info">
                    <p><strong>Checklist ID:</strong> {selectedChecklist.id}</p>
                    <p><strong>Gói bảo dưỡng:</strong> {selectedChecklist.planName}</p>
                    <p><strong>Xe:</strong> {selectedChecklist.vehicleModel}</p>
                    <p><strong>Biển số:</strong> {selectedChecklist.vehicleNumberPlate}</p>
                    <p><strong>Thợ:</strong> {selectedChecklist.technicianName}</p>
                    <p><strong>Trạng thái:</strong>
                      <span
                        className={`status-badge ${selectedChecklist.status === "COMPLETED"
                          ? "status-completed"
                          : "status-inprogress"
                          }`}
                      >
                        {selectedChecklist.status === "COMPLETED"
                          ? "Hoàn thành"
                          : "Đang xử lý"}
                      </span>
                    </p>
                    <p><strong>Chi phí ước tính:</strong> {selectedChecklist.estimatedCost?.toLocaleString()} đ</p>
                    <p><strong>Đã duyệt:</strong> <span style={{ color: "#10b981", fontWeight: "bold" }}>{selectedChecklist.totalCostApproved?.toLocaleString()} đ</span></p>
                    <p><strong>Bị từ chối:</strong> <span style={{ color: "#ef4444", fontWeight: "bold" }}>{selectedChecklist.totalCostDeclined?.toLocaleString()} đ</span></p>
                    <p><strong>Bắt đầu:</strong> {selectedChecklist.startTime ? new Date(selectedChecklist.startTime).toLocaleString("vi-VN") : "N/A"}</p>
                    <p><strong>Kết thúc:</strong> {selectedChecklist.endTime ? new Date(selectedChecklist.endTime).toLocaleString("vi-VN") : "Chưa kết thúc"}</p>
                  </div>

                  {selectedChecklist.details && selectedChecklist.details.length > 0 ? (
                    <div className="checklist-items">
                      <h3>Danh sách công việc:</h3>
                      <table className="checklist-items-table">
                        <thead>
                          <tr>
                            <th>Hạng mục</th>
                            <th>Hành động</th>
                            <th>Chi phí nhân công</th>
                            <th>Chi phí phụ tùng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedChecklist.details.map((detail, index) => {
                            const actionTypeMap = {
                              REPLACE: { text: "Thay thế", className: "status-replace" },
                              REPAIR: { text: "Sửa chữa", className: "status-repair" },
                              ADJUSTMENT: { text: "Hiệu chỉnh", className: "status-adjust" },
                              GOOD: { text: "Tốt", className: "status-good" },
                              INSPECT: { text: "Kiểm tra", className: "status-check" },
                            };
                            const actionInfo =
                              actionTypeMap[detail.status] || {
                                text: detail.status || "N/A",
                                className: "status-default",
                              };

                            return (
                              <tr key={index}>
                                <td>{detail.itemName || detail.description || "N/A"}</td>
                                <td>
                                  <span className={`status-badge ${actionInfo.className}`}>
                                    {actionInfo.text}
                                  </span>
                                </td>
                                <td>
                                  {detail.laborCost
                                    ? `${detail.laborCost.toLocaleString()} đ`
                                    : "-"}
                                </td>
                                <td>
                                  {detail.materialCost
                                    ? `${detail.materialCost.toLocaleString()} đ`
                                    : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {(selectedChecklist.totalCostApproved || selectedChecklist.totalCost) && (
                        <div className="checklist-total">
                          <strong>Tổng chi phí đã duyệt: </strong>
                          {(selectedChecklist.totalCostApproved ||
                            selectedChecklist.totalCost
                          )?.toLocaleString()}{" "}
                          đ
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Chưa có công việc nào trong checklist này.</p>
                  )}
                </div>
              ) : (
                <p>Không có dữ liệu checklist.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {showFeedbackModal && (
        <ViewFeedbackModal
          bookingId={selectedBookingId}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {showPaymentModal && (
        <ViewPaymentModal
          bookingId={selectedBookingId}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      {showConfirmModal && (
        <ConfirmModal
          visible={showConfirmModal}
          message={confirmMessage}
          requireReason={requireReason}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={(reason) => confirmAction && confirmAction(reason)}
          loading={!!actionLoading}
        />
      )}
    </div>
  );
}
