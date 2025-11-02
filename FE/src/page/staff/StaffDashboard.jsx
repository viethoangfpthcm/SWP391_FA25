import React, { useState, useEffect } from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import "./StaffDashboard.css";

// --- Import các phần con ---
import StaffLayout from "./Stafflayout.jsx";
import HeaderSection from "./HeaderSection.jsx";
import FilterBar from "./FilterBar.jsx";
import BookingTable from "./BookingTable.jsx";

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [userInfo, setUserInfo] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // =============================
  // 📡 FETCH API SECTION
  // =============================

  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng.");
      const data = await res.json();
      const fullName = data.fullName || data.name || "N/A";
      const role = data.role || "N/A";
      setUserInfo({ fullName, role });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách lịch hẹn.");
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setAppointments(sorted);
    } catch (err) {
      setError("Lỗi tải lịch hẹn: " + err.message);
      setAppointments([]);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/technicians`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách KTV.");
      const data = await res.json();
      const mapped = data.map((t) => ({
        userId: String(t.userId || t.id),
        fullName: t.fullName || t.name || "N/A",
        activeBookings: parseInt(t.activeBookings) || 0,
      }));
      setTechnicians(mapped);
    } catch (err) {
      setError("Lỗi tải KTV: " + err.message);
      setTechnicians([]);
    }
  };

  // =============================
  // ⚙️ LOAD DATA
  // =============================
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchUserInfo();
      await Promise.allSettled([fetchAppointments(), fetchTechnicians()]);
      setLoading(false);
    };
    load();

    // Auto-refresh
    const interval = setInterval(() => fetchAppointments(), 10000);
    return () => clearInterval(interval);
  }, []);

  // =============================
  // 🧠 ACTION HANDLERS
  // =============================

  const handleTechnicianChange = (bookingId, techId) => {
    setSelectedTechnicians((prev) => ({ ...prev, [bookingId]: techId }));
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/staff/bookings/${bookingId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
    } catch (err) {
      setError(`Lỗi duyệt: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(
        `${API_BASE}/api/staff/bookings/${bookingId}/decline?reason=${encodeURIComponent(reason)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
    } catch (err) {
      setError(`Lỗi từ chối: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async (bookingId) => {
    const techId = selectedTechnicians[bookingId];
    if (!techId) return alert("Vui lòng chọn kỹ thuật viên.");
    setActionLoading(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/staff/bookings/assign-technician`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          technicianId: parseInt(techId),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
      await fetchTechnicians();
    } catch (err) {
      setError(`Lỗi phân công: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHandover = async (bookingId) => {
    if (!window.confirm("Xác nhận bàn giao xe?")) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/staff/bookings/${bookingId}/handover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
    } catch (err) {
      setError(`Lỗi bàn giao: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewChecklist = (bookingId) => {
    window.location.href = `/staff/checklist/${bookingId}`;
  };

  // =============================
  // 🎨 RENDER
  // =============================
  if (loading) {
    return (
      <StaffLayout>
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </main>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <HeaderSection
        title="Quản lý lịch hẹn"
        subtitle="Xem, duyệt, phân công và bàn giao lịch hẹn cho kỹ thuật viên"
        userInfo={userInfo}
      />

      {error && (
        <div className="error-message general-error">
          <FaExclamationTriangle /> {error}
          <button onClick={() => setError(null)} className="clear-error-btn">
            ×
          </button>
        </div>
      )}

      <FilterBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      <BookingTable
        appointments={appointments}
        technicians={technicians}
        selectedTechnicians={selectedTechnicians}
        statusFilter={statusFilter}
        actionLoading={actionLoading}
        handleTechnicianChange={handleTechnicianChange}
        handleApprove={handleApprove}
        handleDecline={handleDecline}
        handleAssign={handleAssign}
        handleHandover={handleHandover}
        handleViewChecklist={handleViewChecklist}
      />
    </StaffLayout>
  );
}
