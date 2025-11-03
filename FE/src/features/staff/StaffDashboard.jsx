import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import "./StaffDashboard.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import BookingFilters from "./shared/BookingFilters";
import BookingTable from "./shared/BookingTable";
import ViewFeedbackModal from "./shared/ViewFeedbackModal";
import ViewPaymentModal from "./shared/ViewPaymentModal";

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

  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const API_BASE = "";
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
      await fetchAppointments(); // Tải lại danh sách để thấy status 'Completed'

    } catch (err) {
      console.error("❌ Error handing over vehicle:", err);
      setError(`Lỗi khi bàn giao: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };



  // *** SỬA LẠI HÀM NÀY: Staff có thể xem checklist sớm hơn ***
  const hasChecklist = (status) => {
    const statusText = status ? status.toLowerCase() : '';
    // Staff có thể xem checklist ngay khi đã phân công
    return ['assigned', 'in_progress', 'completed', 'paid'].includes(statusText);
  };

  // Hàm điều hướng đến trang xem Checklist
  const handleViewChecklist = (bookingId) => {
    // Sử dụng Booking ID để gọi API Checklist của Staff
    navigate(`/staff/checklist/${bookingId}`);
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

    // DÒNG DEBUG: Dán dòng này vào để xem chính xác nó đang so sánh gì vs '${statusB}' (rank ${rankB})`);

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
    }, 30000); // 30 giây - tránh gọi API quá nhiều

    return () => clearInterval(interval); // Dọn dẹp khi rời trang
  }, []);

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
          <Loading inline />
          <p>Đang tải dữ liệu...</p>
        </main>
      </div>
    );
  }



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
          onDecline={handleDecline}
          onAssign={handleAssign}
          onHandover={handleHandover}
          onViewChecklist={handleViewChecklist}
          onViewFeedback={handleViewFeedback}
          onViewPayment={handleViewPayment}
        />
      </main>

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
    </div>
  );
}
