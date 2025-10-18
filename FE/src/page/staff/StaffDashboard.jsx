import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEye, FaFilter, FaSpinner, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import "./StaffDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard({ user, userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Hàm fetch danh sách lịch hẹn
  const fetchAppointments = async () => {
    try {
      console.log("📅 Fetching pending appointments...");
      setError(null);
      const response = await fetch(`${API_BASE}/api/staff/bookings`, {
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
      console.log("✅ Appointments data fetched:", data);
      setAppointments(Array.isArray(data) ? data : []);
      return true;

    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setError("Lỗi kết nối hoặc xử lý dữ liệu lịch hẹn.");
      setAppointments([]);
      return false;
    }
  };

  // Hàm fetch danh sách kỹ thuật viên
  const fetchTechnicians = async () => {
    try {
      console.log("👨‍🔧 Fetching technicians...");
      setError(null);
      const res = await fetch(`${API_BASE}/api/staff/technicians`, {
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
          setError(`Không thể tải danh sách KTV (${res.status}): ${errorText}`)
        }
        setTechnicians([]);
        return false;
      }

      const data = await res.json();
      console.log("✅ Technicians data fetched:", data);

      if (!Array.isArray(data)) {
        console.warn("API returned non-array for technicians, setting to empty array.");
        setTechnicians([]);
        return true;
      }

      const mapped = data.map((t) => ({
        userId: String(t.userId || t.id || ""),
        fullName: t.fullName || t.name || "N/A",
        activeBookings: parseInt(t.activeBookings) || 0,
      }));
      console.log("Mapped technicians:", mapped);
      setTechnicians(mapped);
      return true;

    } catch (err) {
      console.error("❌ Error fetching technicians:", err);
      setError("Lỗi kết nối hoặc xử lý dữ liệu kỹ thuật viên.");
      setTechnicians([]);
      return false;
    }
  };

  // Load data khi component được mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
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
    console.log(`👤 Technician selected for booking ${bookingId}: ${technicianId}`);
    setSelectedTechnicians((prev) => ({
      ...prev,
      [bookingId]: technicianId,
    }));
  };

  // Hàm lấy tên technician từ danh sách bằng userId
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return '—';
    const tech = technicians.find(t => String(t.userId) === String(technicianId));
    return tech ? tech.fullName : `KTV #${technicianId}`;
  };

  // Hàm xử lý phê duyệt và phân công
  const handleAssign = async (bookingId) => {
    const technicianId = selectedTechnicians[bookingId];
    if (!technicianId) {
      setError("Vui lòng chọn một kỹ thuật viên để phân công.");
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      console.log(`✍️ Assigning technician ${technicianId} to booking ${bookingId}...`);
      const res = await fetch(
        `${API_BASE}/api/staff/bookings/assign-technician`,
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

      console.log(`✅ Assignment successful for booking ${bookingId}`);

      setSelectedTechnicians((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await fetchAppointments();

    } catch (err) {
      console.error("❌ Error assigning technician:", err);
      setError(`Lỗi khi phân công: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Hàm xử lý từ chối
  const handleDecline = async (bookingId) => {
    const reason = prompt("Nhập lý do từ chối (bắt buộc):");
    if (!reason) {
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      console.log(`❌ Declining booking ${bookingId} with reason: ${reason}...`);
      const url = `${API_BASE}/api/staff/bookings/${bookingId}/decline?reason=${encodeURIComponent(reason)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Decline API failed:", res.status, errorText);
        throw new Error(errorText || "Từ chối thất bại.");
      }

      console.log(`✅ Decline successful for booking ${bookingId}`);
      await fetchAppointments();

    } catch (err) {
      console.error("❌ Error declining appointment:", err);
      setError(`Lỗi khi từ chối: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Hàm tạo badge trạng thái
  const getStatusBadge = (status) => {
    const statusText = status ? status.toLowerCase() : 'unknown';
    let label = status || 'Không xác định';
    let className = 'status-default';

    switch (statusText) {
      case 'pending': label = 'Chờ xử lý'; className = 'status-pending'; break;
      case 'approved': label = 'Đã duyệt'; className = 'status-approved'; break;
      case 'assigned': label = 'Đã phân công'; className = 'status-assigned'; break;
      case 'in progress': label = 'Đang thực hiện'; className = 'status-inprogress'; break;
      case 'completed': label = 'Hoàn thành'; className = 'status-completed'; break;
      case 'declined': label = 'Đã từ chối'; className = 'status-declined'; break;
      case 'paid': label = 'Đã thanh toán'; className = 'status-paid'; break;
    }

    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar sidebarOpen={true} />
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </main>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(appt =>
    statusFilter === 'all' || (appt.status && appt.status.toLowerCase() === statusFilter)
  );

  return (
    <div className="dashboard-container">
      <Sidebar sidebarOpen={true} />
      <main className="main-content">
        <header className="page-header">
          <h1><FaCalendarAlt /> Quản lý lịch hẹn</h1>
          <p>Xem xét, phân công và theo dõi các lịch hẹn của khách hàng.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="actions-bar">
          <div className="filter-group">
            <label htmlFor="statusFilter"><FaFilter /> Lọc:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã duyệt</option>
              <option value="assigned">Đã phân công</option>
              <option value="in progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="declined">Đã từ chối</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ngày hẹn</th>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Biển số</th>
                  <th>Dòng xe</th>
                  <th>Số KM</th>
                  <th>Kỹ thuật viên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!error && filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.bookingId}>
                      <td><span className="cell-main">#{appt.bookingId}</span></td>
                      <td>
                        <span className="cell-main">{new Date(appt.bookingDate).toLocaleDateString("vi-VN")}</span>
                        <span className="cell-sub">{new Date(appt.bookingDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td><span className="cell-main">{appt.customerName}</span></td>
                      <td><span className="cell-sub">{appt.customerPhone || 'N/A'}</span></td>
                      <td><span className="cell-main">{appt.vehiclePlate}</span></td>
                      <td><span className="cell-sub">{appt.vehicleModel}</span></td>
                      <td><span className="cell-sub">{appt.currentKm ? appt.currentKm.toLocaleString() + ' km' : 'N/A'}</span></td>
                      <td>
                        {(appt.status?.toLowerCase() === "pending" || appt.status?.toLowerCase() === "approved") ? (
                          <div className="technician-select-wrapper">
                            <select
                              className="technician-select"
                              value={selectedTechnicians[appt.bookingId] || ""}
                              onChange={(e) => handleTechnicianChange(appt.bookingId, e.target.value)}
                              disabled={actionLoading === appt.bookingId}
                            >
                              <option value="">-- Chọn KTV --</option>
                              {technicians.length > 0 ? (
                                technicians.map((tech) => (
                                  <option key={tech.userId} value={tech.userId}>
                                    {tech.fullName} ({tech.activeBookings} việc)
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>Không có KTV</option>
                              )}
                            </select>
                            {selectedTechnicians[appt.bookingId] && technicians.find(t => t.userId === selectedTechnicians[appt.bookingId])?.activeBookings > 0 && (
                              <span className="tech-note">Đang bận {technicians.find(t => t.userId === selectedTechnicians[appt.bookingId])?.activeBookings} việc</span>
                            )}
                          </div>
                        ) : (
                          <span className="cell-sub">{appt.technicianName || getTechnicianName(appt.technicianId) || '—'}</span>
                        )}
                      </td>
                      <td>{getStatusBadge(appt.status)}</td>
                      <td>
                        {(appt.status?.toLowerCase() === "pending" || appt.status?.toLowerCase() === "approved") ? (
                          <div className="action-buttons-cell">
                            <button
                              className="btn-action btn-approve"
                              onClick={() => handleAssign(appt.bookingId)}
                              disabled={!selectedTechnicians[appt.bookingId] || actionLoading === appt.bookingId}
                            >
                              {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Phân công
                            </button>
                            <button
                              className="btn-action btn-decline"
                              onClick={() => handleDecline(appt.bookingId)}
                              disabled={actionLoading === appt.bookingId}
                            >
                              {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaTimes />} Từ chối
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-action btn-view"
                            onClick={() => navigate(`/staff/checklist/${appt.bookingId}`)} 
                            disabled={actionLoading === appt.bookingId}
                          >
                            <FaEye /> Xem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  !error && (
                    <tr>
                      <td colSpan="10" className="empty-state">
                        <p>
                          {statusFilter === 'all'
                            ? 'Hiện không có lịch hẹn nào.'
                            : `Không có lịch hẹn nào ở trạng thái "${statusFilter}".`}
                        </p>
                      </td>
                    </tr>
                  )
                )}
                {error && filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="10" className="empty-state error-in-table">
                      <FaExclamationTriangle />
                      <p>Đã xảy ra lỗi khi tải dữ liệu.</p>
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