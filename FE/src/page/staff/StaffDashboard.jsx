import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEye, FaFilter, FaSpinner, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import "./StaffDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

if (import.meta.env.MODE !== "development") {
  console.log = () => { };
}

export default function StaffDashboard({ user, userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
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
      const response = await fetch(`${API_BASE}/api/users/account/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user info:", response.status);
        if (response.status === 401) {
          // Xử lý lỗi 401: Đăng xuất
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

  // Hàm fetch danh sách lịch hẹn
  const fetchAppointments = async () => {
    try {
      console.log("📅 Fetching all appointments...");
      setError(null);
      // API này trả về StaffBookingDTO (đã bao gồm checklistStatus)
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
      // Sắp xếp cho booking mới nhất lên đầu
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) =>
        new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setAppointments(sortedData);
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
      await fetchTechnicians(); // Tải lại KTV để cập nhật số việc

    } catch (err) {
      console.error("❌ Error assigning technician:", err);
      setError(`Lỗi khi phân công: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };
  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    setError(null);

    try {
      console.log(`👍 Approving booking ${bookingId}...`);

      const res = await fetch(
        `${API_BASE}/api/staff/bookings/${bookingId}/approve`,
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
        return; // Dừng lại nếu lỗi
      }

      console.log(`Approve successful for booking ${bookingId}`);
      await fetchAppointments(); // Tải lại danh sách để cập nhật trạng thái

    } catch (err) {
      console.error(" Error approving booking:", err);
      setError(`Lỗi khi duyệt: ${err.message}`);
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

  // *** THÊM MỚI: HÀM BÀN GIAO XE ***
  const handleHandover = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn BÀN GIAO XE và hoàn tất booking này?")) {
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      console.log(`🚀 Handing over vehicle for booking ${bookingId}...`);
      const url = `${API_BASE}/api/staff/bookings/${bookingId}/handover`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Handover API failed:", res.status, errorText);
        // Hiển thị lỗi nghiệp vụ từ backend
        throw new Error(errorText || "Bàn giao thất bại.");
      }

      console.log(`✅ Handover successful for booking ${bookingId}`);
      await fetchAppointments(); // Tải lại danh sách để thấy status 'Completed'

    } catch (err) {
      console.error("❌ Error handing over vehicle:", err);
      setError(`Lỗi khi bàn giao: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };
  // *** KẾT THÚC HÀM MỚI ***

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
      // 'Completed' bây giờ là trạng thái cuối cùng (sau khi bàn giao)
      case 'completed': label = 'Đã hoàn tất'; className = 'status-completed'; break;
      case 'declined': label = 'Đã từ chối'; className = 'status-declined'; break;
      case 'paid': label = 'Đã thanh toán'; className = 'status-paid'; break; // (Chờ bàn giao)
      case 'cancelled': label = 'Đã hủy'; className = 'status-declined'; break;
    }

    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  // *** SỬA LẠI HÀM NÀY: Staff có thể xem checklist sớm hơn ***
  const hasChecklist = (status) => {
    const statusText = status ? status.toLowerCase() : '';
    // Staff có thể xem checklist ngay khi đã phân công
    return ['assigned', 'in progress', 'completed', 'paid'].includes(statusText);
  };

  // Hàm điều hướng đến trang xem Checklist
  const handleViewChecklist = (bookingId) => {
    // Sử dụng Booking ID để gọi API Checklist của Staff
    navigate(`/staff/checklist/${bookingId}`);
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar
          sidebarOpen={true}
          userName={userInfo?.fullName}
          userRole={userInfo?.role}
        />
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
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="main-content">
        <header className="page-header">
          <h1><FaCalendarAlt /> Quản lý lịch hẹn</h1>
          <p>Xem xét, phân công và theo dõi các lịch hẹn của khách hàng.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
            {/* Nút clear lỗi */}
            <button onClick={() => setError(null)} className="clear-error-btn">&times;</button>
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
              <option value="paid">Đã thanh toán (Chờ bàn giao)</option>
              <option value="declined">Đã từ chối</option>
              <option value="cancelled">Đã hủy</option>             
              <option value="completed">Đã hoàn tất </option>
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
                  <th>Trạng thái </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!error && filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => {
                    const statusText = appt.status?.toLowerCase();
                    const checklistStatusText = appt.checklistStatus?.toLowerCase();

                    const isPending = statusText === 'pending';
                    const isApproved = statusText === 'approved';
                    const isPaid = statusText === 'paid';
                    const isChecklistCompleted = checklistStatusText === 'completed';
                    const hasAssignedTech = appt.technicianId || appt.technicianName;

                    return (
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
                          {isApproved && !hasAssignedTech ? (
                            // CHỈ HIỂN THỊ DROPDOWN KHI ĐÃ DUYỆT VÀ CHƯA PHÂN CÔNG
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
                              {/* HIỂN THỊ CẢNH BÁO BẬN */}
                              {selectedTechnicians[appt.bookingId] && technicians.find(t => t.userId === selectedTechnicians[appt.bookingId])?.activeBookings > 0 && (
                                <span className="tech-note">Đang bận {technicians.find(t => t.userId === selectedTechnicians[appt.bookingId])?.activeBookings} việc</span>
                              )}
                            </div>
                          ) : isPending ? (
                            // NẾU LÀ PENDING, HIỂN THỊ CHỜ DUYỆT
                            <span className="cell-sub">Chờ duyệt</span>
                          ) : (
                            // CÁC TRƯỜNG HỢP KHÁC HIỂN THỊ TÊN KTV (ĐÃ PHÂN CÔNG, ĐANG LÀM, HOÀN THÀNH)
                            <span className="cell-sub">{appt.technicianName || getTechnicianName(appt.technicianId) || '—'}</span>
                          )}
                        </td>

                        <td>
                          {/* Hiển thị cả 2 trạng thái nếu cần */}
                          {getStatusBadge(appt.status)}
                          
                        </td>

                        <td>
                          {/* *** CẬP NHẬT LOGIC NÚT BẤM *** */}
                          {isPending ? (
                            // 1. TRẠNG THÁI CHỜ XỬ LÝ: DUYỆT / TỪ CHỐI
                            <div className="action-buttons-cell">
                              <button
                                className="btn-action btn-approve"
                                onClick={() => handleApprove(appt.bookingId)}
                                disabled={actionLoading === appt.bookingId}
                              >
                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Duyệt
                              </button>
                              <button
                                className="btn-action btn-decline"
                                onClick={() => handleDecline(appt.bookingId)}
                                disabled={actionLoading === appt.bookingId}
                              >
                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaTimes />} Từ chối
                              </button>
                            </div>
                          ) : isApproved && !hasAssignedTech ? (
                            // 2. TRẠNG THÁI ĐÃ DUYỆT & CHƯA PHÂN CÔNG: PHÂN CÔNG
                            <div className="action-buttons-cell">
                              <button
                                className="btn-action btn-assign"
                                onClick={() => handleAssign(appt.bookingId)}
                                disabled={!selectedTechnicians[appt.bookingId] || actionLoading === appt.bookingId}
                              >
                                {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Phân công
                              </button>
                            </div>
                            // 3.  ĐÃ THANH TOÁN & CHECKLIST HOÀN THÀNH: BÀN GIAO XE ***
                          ) : (isPaid && isChecklistCompleted) ? (
                            <button
                              className="btn-action btn-handover" 
                              onClick={() => handleHandover(appt.bookingId)}
                              disabled={actionLoading === appt.bookingId}
                            >
                              {actionLoading === appt.bookingId ? <FaSpinner className="spinner-icon" /> : <FaCheck />} Bàn giao
                            </button>
                            // 4. TRẠNG THÁI ĐÃ CÓ CHECKLIST (assigned, in progress, v.v.): XEM
                          ) : hasChecklist(statusText) ? (
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewChecklist(appt.bookingId)}
                              disabled={actionLoading === appt.bookingId}
                            >
                              <FaEye /> Xem
                            </button>
                          ) : (
                            // 5. TRẠNG THÁI CÒN LẠI (Declined, Cancelled, Completed...)
                            <span className="cell-sub">—</span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  !error && (
                    <tr>
                      <td colSpan="10" className="empty-state">
                        <p>
                          s   {statusFilter === 'all'
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
                      a     <p>Đã xảy ra lỗi khi tải dữ liệu.</p>
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