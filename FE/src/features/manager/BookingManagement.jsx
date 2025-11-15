import React, { useState, useEffect } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import Sidebar from "@components/layout/Sidebar.jsx";
import { API_BASE_URL } from "@config/api.js";
import { FaCalendarAlt, FaEye, FaClipboardList, FaComments, FaTimes } from "react-icons/fa";
import "./BookingManagement.css";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";

export default function BookingManagement() {
  // Helper: parse server datetime strings (handles excessive fractional seconds like .0086813)
  const parseServerDate = (s) => {
    if (!s) return null;
    try {
      // If string contains timezone (Z or +hh:mm), rely on Date parser
      if (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s)) {
        const d = new Date(s);
        return isNaN(d) ? null : d;
      }

      // Match ISO-like without timezone: YYYY-MM-DDTHH:mm:ss(.fractional)
      const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
      if (!m) {
        const d = new Date(s);
        return isNaN(d) ? null : d;
      }
      const [, Y, Mo, D, hh, mm, ss, frac] = m;
      const ms = frac ? Number((frac + '000').slice(0, 3)) : 0; // take first 3 digits as milliseconds
      // Construct Date in local timezone
      return new Date(Number(Y), Number(Mo) - 1, Number(D), Number(hh), Number(mm), Number(ss), ms);
    } catch (e) {
      console.warn('parseServerDate failed for', s, e);
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }
  };
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklist = async (bookingId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/checklist/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Checklist API Response:", data); // Debug log
        setSelectedChecklist(data);
        setShowChecklistModal(true);
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

  const fetchFeedback = async (bookingId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/feedback/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFeedback(data);
        setShowFeedbackModal(true);
      } else {
        alert("Không thể tải feedback. Có thể khách hàng chưa đánh giá.");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      alert("Lỗi khi tải feedback!");
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: "Chờ xử lý", className: "status-pending" },
      APPROVED: { text: "Đã duyệt", className: "status-approved" },
      ASSIGNED: { text: "Đã gán thợ", className: "status-assigned" },
      IN_PROGRESS: { text: "Đang xử lý", className: "status-inprogress" },
      COMPLETED: { text: "Hoàn thành", className: "status-completed" },
      PAID: { text: "Đã thanh toán", className: "status-paid" },
      CANCELLED: { text: "Đã hủy", className: "status-cancelled" },
      DECLINED: { text: "Đã từ chối", className: "status-declined" },
    };
    return badges[status] || { text: status, className: "status-default" };
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  });

   if (showLoading) {
  return (
    <Loading text="Đang tải lịch hẹn..." />
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
            <FaCalendarAlt /> Quản lý đặt lịch
          </h1>
          <p className="subtitle">Xem và theo dõi các lịch hẹn trong trung tâm</p>
        </header>

        <div className="admin-content">
          <div className="booking-filters">
            <label>Trạng thái:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="ASSIGNED">Đã gán thợ</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="DECLINED">Đã từ chối</option>
            </select>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <FaCalendarAlt size={48} />
              <p>Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="booking-table-container">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Xe</th>
                    <th>Ngày hẹn</th>
                    <th>Dịch vụ</th>
                    <th>Trạng thái</th>
                    <th>Kỹ thuật viên</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const badge = getStatusBadge(booking.status);
                    return (
                      <tr key={booking.bookingId}>
                        <td>{booking.bookingId}</td>
                        <td>
                          <div>
                            <strong>{booking.customerName || "N/A"}</strong>
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                              {booking.customerPhone || ""}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{booking.vehicleModel || "N/A"}</div>
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                              {booking.vehiclePlate || ""}
                            </div>
                          </div>
                        </td>
                        <td>
                          {booking.bookingDate 
                            ? new Date(booking.bookingDate).toLocaleString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "N/A"}
                        </td>
                        <td>{booking.planName || "N/A"}</td>
                        <td>
                          <span className={`status-badge ${badge.className}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td>{booking.technicianName || "Chưa gán"}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => fetchChecklist(booking.bookingId)}
                              style={{ padding: '6px 12px', fontSize: '0.9em' }}
                            >
                              <FaClipboardList /> Checklist
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => fetchFeedback(booking.bookingId)}
                              style={{ padding: '6px 12px', fontSize: '0.9em' }}
                            >
                              <FaComments /> Feedback
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Checklist Modal */}
        {showChecklistModal && (
          <div className="modal-overlay" onClick={() => setShowChecklistModal(false)}>
            <div className="modal-content modal-content-checklist" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaClipboardList /> Chi tiết Checklist</h2>
                <button className="modal-close" onClick={() => setShowChecklistModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {modalLoading ? (
                  <Loading inline />
                ) : selectedChecklist ? (
                  <div className="checklist-details">
                    {console.log("Rendering checklist:", selectedChecklist)}
                    <div className="checklist-info">
                      <p><strong>Checklist ID:</strong> {selectedChecklist.id}</p>
                      <p><strong>Gói bảo dưỡng:</strong> {selectedChecklist.planName}</p>
                      <p><strong>Xe:</strong> {selectedChecklist.vehicleModel}</p>
                      <p><strong>Biển số:</strong> {selectedChecklist.vehicleNumberPlate}</p>
                      <p><strong>Km hiện tại:</strong> {selectedChecklist.currentKm?.toLocaleString()} km</p>
                      <p><strong>Km bảo dưỡng:</strong> {selectedChecklist.maintenanceKm?.toLocaleString()} km</p>
                      <p><strong>Kỹ thuật viên:</strong> {selectedChecklist.technicianName}</p>
                      <p><strong>Trạng thái:</strong> 
                        <span className={`status-badge ${selectedChecklist.status === 'COMPLETED' ? 'status-completed' : 'status-inprogress'}`}>
                          {selectedChecklist.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                      </p>
                      <p><strong>Chi phí ước tính:</strong> {selectedChecklist.estimatedCost?.toLocaleString()} đ</p>
                      <p><strong>Chi phí đã duyệt:</strong> <span style={{color: '#10b981', fontWeight: 'bold'}}>{selectedChecklist.totalCostApproved?.toLocaleString()} đ</span></p>
                      <p><strong>Chi phí bị từ chối:</strong> <span style={{color: '#ef4444', fontWeight: 'bold'}}>{selectedChecklist.totalCostDeclined?.toLocaleString()} đ</span></p>
                      <p><strong>Thời gian bắt đầu:</strong> {selectedChecklist.startTime ? new Date(selectedChecklist.startTime).toLocaleString('vi-VN') : "N/A"}</p>
                      <p><strong>Thời gian kết thúc:</strong> {selectedChecklist.endTime ? new Date(selectedChecklist.endTime).toLocaleString('vi-VN') : "Chưa kết thúc"}</p>
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
                                'REPLACE': { text: 'Thay thế', className: 'status-replace' },
                                'REPAIR': { text: 'Sửa chữa', className: 'status-repair' },
                                'ADJUSTMENT': { text: 'Hiệu chỉnh', className: 'status-adjust' },
                                'GOOD': { text: 'Tốt', className: 'status-good' },
                                'INSPECT': { text: 'Kiểm tra', className: 'status-check' }
                              };
                              // Use 'status' field (final result) instead of 'actionType' (initial action)
                              const actionInfo = actionTypeMap[detail.status] || { text: detail.status, className: 'status-default' };
                              
                              return (
                                <tr key={index}>
                                  <td>{detail.itemName || detail.description || "N/A"}</td>
                                  <td>
                                    <span className={`status-badge ${actionInfo.className}`}>
                                      {actionInfo.text}
                                    </span>
                                  </td>
                                  <td>{detail.laborCost ? `${detail.laborCost.toLocaleString()} đ` : "-"}</td>
                                  <td>{detail.materialCost ? `${detail.materialCost.toLocaleString()} đ` : "-"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {(selectedChecklist.totalCostApproved || selectedChecklist.totalCost) && (
                          <div className="checklist-total">
                            <strong>Tổng chi phí đã duyệt: </strong>
                            {(selectedChecklist.totalCostApproved || selectedChecklist.totalCost)?.toLocaleString()} đ
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>Chưa có công việc nào trong checklist</p>
                    )}
                  </div>
                ) : (
                  <p>Không có dữ liệu checklist</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
            <div className="modal-content admin-modal feedback-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Đánh giá của khách hàng</h2>
                <button className="close-modal-btn" onClick={() => setShowFeedbackModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {modalLoading ? (
                  <Loading inline />
                ) : selectedFeedback ? (
                  <div className="feedback-details">
                    <div className="feedback-rating">
                      <p><strong>Đánh giá:</strong></p>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              color: star <= (selectedFeedback.rating || 0) ? '#ffc107' : '#ddd',
                              fontSize: '24px'
                            }}
                          >
                            ★
                          </span>
                        ))}
                        <span style={{ marginLeft: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                          {selectedFeedback.rating || 0}/5
                        </span>
                      </div>
                    </div>
                    <div className="feedback-info">
                      <p><strong>Booking ID:</strong> {selectedFeedback.bookingId}</p>
                      <p><strong>Khách hàng:</strong> {selectedFeedback.userName || "N/A"}</p>
                      <p><strong>Ngày đánh giá:</strong> {(() => {
                        const dateStr = selectedFeedback.feedbackDate ?? selectedFeedback.createdAt;
                        const d = parseServerDate(dateStr);
                        return d ? d.toLocaleString('vi-VN', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        }) : 'N/A';
                      })()}</p>
                    </div>
                    <div className="feedback-comment">
                      <p><strong>Nhận xét:</strong></p>
                      <div className="comment-box">
                        {selectedFeedback.comment || "Khách hàng không để lại nhận xét"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Không có dữ liệu feedback</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
