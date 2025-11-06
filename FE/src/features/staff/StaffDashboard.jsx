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
import { API_BASE_URL } from "@config/api.js";

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

  
  const token = localStorage.getItem("token");

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    // Ki?m tra token v� tr�nh l?i
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
          // X? l� l?i 401: �ang xu?t
          localStorage.removeItem("token");
          localStorage.removeItem("fullName");
          localStorage.removeItem("role");
          navigate("/");
        }
        throw new Error("Kh�ng th? t?i th�ng tin ngu?i d�ng.");
      }

      const data = await response.json();
      const fetchedFullName = data.fullName || data.name || "N/A";
      const fetchedRole = data.role || "N/A";

      // LUU V�O LOCAL STORAGE
      localStorage.setItem('fullName', fetchedFullName);
      localStorage.setItem('role', fetchedRole);

      // C?P NH?T STATE
      setUserInfo({
        fullName: fetchedFullName,
        role: fetchedRole
      });
      setError(null);

    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(`Lỗi tải thông tin nguời dùng: ${err.message}`);
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
          setError("Phiên dang nhập hết hạn. Đang chuyển huớng...");
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
      // S?p x?p cho booking m?i nh?t l�n d?u
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) =>
        new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setAppointments(sortedData);
      return true;

    } catch (error) {
      console.error("? Error fetching appointments:", error);
      setError("L?i k?t n?i ho?c x? l� d? li?u l?ch h?n.");
      setAppointments([]);
      return false;
    }
  };

  // H�m fetch danh s�ch k? thu?t vi�n
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
          setError("Phi�n dang nh?p h?t h?n khi t?i KTV.");
        } else {
          setError(`Kh�ng th? t?i danh s�ch KTV (${res.status}): ${errorText}`)
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
      console.error("? Error fetching technicians:", err);
      setError("L?i k?t n?i ho?c x? l� d? li?u k? thu?t vi�n.");
      setTechnicians([]);
      return false;
    }
  };

  // Load data khi component du?c mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchUserInfo();
      // Ch?y song song
      await Promise.allSettled([fetchAppointments(), fetchTechnicians()]);
      setLoading(false);
    };

    if (!token) {
      setError("Vui l�ng dang nh?p d? truy c?p trang n�y.");
      setLoading(false);
      navigate("/");
      return;
    }
    loadData();
  }, [token, navigate]);

  // X? l� khi ch?n k? thu?t vi�n
  const handleTechnicianChange = (bookingId, technicianId) => {
    setSelectedTechnicians((prev) => ({
      ...prev,
      [bookingId]: technicianId,
    }));
  };

  // H�m l?y t�n technician t? danh s�ch b?ng userId
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return '�';
    const tech = technicians.find(t => String(t.userId) === String(technicianId));
    return tech ? tech.fullName : `KTV #${technicianId}`;
  };

  // H�m x? l� ph� duy?t v� ph�n c�ng
  const handleAssign = async (bookingId) => {
    const technicianId = selectedTechnicians[bookingId];
    if (!technicianId) {
      setError("Vui l�ng ch?n m?t k? thu?t vi�n d? ph�n c�ng.");
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
        throw new Error(errorText || "Ph�n c�ng th?t b?i.");
      }
      setSelectedTechnicians((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await fetchAppointments();
      await fetchTechnicians(); // T?i l?i KTV d? c?p nh?t s? vi?c

    } catch (err) {
      console.error("? Error assigning technician:", err);
      setError(`L?i khi ph�n c�ng: ${err.message}`);
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
          setError("Phi�n dang nh?p h?t h?n. Vui l�ng dang nh?p l?i.");
          setTimeout(() => navigate("/"), 1500);
        } else {
          throw new Error(errorText || `Duy?t th?t b?i (${res.status})`);
        }
        return; // D?ng l?i n?u l?i
      }
      await fetchAppointments(); // T?i l?i danh s�ch d? c?p nh?t tr?ng th�i

    } catch (err) {
      console.error(" Error approving booking:", err);
      setError(`L?i khi duy?t: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // H�m x? l� t? ch?i
  const handleDecline = async (bookingId) => {
    const reason = prompt("Nh?p l� do t? ch?i (b?t bu?c):");
    if (!reason) {
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      const url = `${API_BASE_URL}/api/staff/bookings/${bookingId}/decline?reason=${encodeURIComponent(reason)}`;

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
        throw new Error(errorText || "T? ch?i th?t b?i.");
      }
      await fetchAppointments();

    } catch (err) {
      console.error("? Error declining appointment:", err);
      setError(`L?i khi t? ch?i: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // *** TH�M M?I: H�M B�N GIAO XE ***
  const handleHandover = async (bookingId) => {
    if (!window.confirm("B?n c� ch?c ch?n mu?n B�N GIAO XE v� ho�n t?t booking n�y?")) {
      return;
    }

    setActionLoading(bookingId);
    setError(null);

    try {
      const url = `${API_BASE_URL}/api/staff/bookings/${bookingId}/handover`;

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
        // Hi?n th? l?i nghi?p v? t? backend
        throw new Error(errorText || "B�n giao th?t b?i.");
      }
      await fetchAppointments(); // T?i l?i danh s�ch d? th?y status 'Completed'

    } catch (err) {
      console.error("? Error handing over vehicle:", err);
      setError(`L?i khi b�n giao: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // *** S?A L?I H�M N�Y: Staff c� th? xem checklist s?m hon ***
  const hasChecklist = (status) => {
    const statusText = status ? status.toLowerCase() : '';
    // Staff c� th? xem checklist ngay khi d� ph�n c�ng
    return ['assigned', 'in_progress', 'completed', 'paid'].includes(statusText);
  };

  // H�m di?u hu?ng d?n trang xem Checklist
  const handleViewChecklist = (bookingId) => {
    // S? d?ng Booking ID d? g?i API Checklist c?a Staff
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

    // D�NG DEBUG: D�n d�ng n�y v�o d? xem ch�nh x�c n� dang so s�nh g� vs '${statusB}' (rank ${rankB})`);

    const finalRankA = rankA === -1 ? Infinity : rankA;
    const finalRankB = rankB === -1 ? Infinity : rankB;

    if (finalRankA !== finalRankB) {
      return finalRankA - finalRankB;
    }

    return new Date(a.bookingDate) - new Date(b.bookingDate);
  });
  // --- Auto refresh danh s�ch l?ch h?n m?i 30 gi�y ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30 gi�y - tr�nh g?i API qu� nhi?u

    return () => clearInterval(interval); // D?n d?p khi r?i trang
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
          <p>�ang t?i d? li?u...</p>
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
          <h1><FaCalendarAlt /> Qu?n l� l?ch h?n</h1>
          <p>Xem x�t, ph�n c�ng v� theo d�i c�c l?ch h?n c?a kh�ch h�ng.</p>
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
