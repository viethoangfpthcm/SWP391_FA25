import React, { useState, useEffect } from "react";
import "./StaffDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";

export default function StaffDashboard({ user, userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // Bộ lọc trạng thái

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const token = localStorage.getItem("token");

  // Fetch appointments
  const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/api/staff/bookings/pending?centerId=4", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    // ✅ Kiểm tra xem có phải mảng không
    console.log("Appointments data:", data);

    if (Array.isArray(data)) {
      setAppointments(data);
    } else {
      setAppointments([]); // fallback nếu backend trả object
    }

  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};


  // Fetch technicians
  const fetchTechnicians = async () => {
    try {
      console.log("🔄 Fetching technicians...");
      const res = await fetch(`${API_BASE}/api/staff/technicians`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Technicians API failed:", res.status);
        setTechnicians([]);
        return;
      }

      const data = await res.json();
      console.log("Technicians raw:", data);

      if (!Array.isArray(data)) {
        console.error("Not an array:", data);
        setTechnicians([]);
        return;
      }

      const mapped = data.map((t) => ({
        userId: String(t.userId || t.id || ""),
        fullName: t.fullName || t.name || "Unknown",
        activeBookings: parseInt(t.activeBookings) || 0,
      }));

      console.log("Technicians mapped:", mapped);
      setTechnicians(mapped);
    } catch (err) {
      console.error("Technicians error:", err);
      setTechnicians([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchTechnicians()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle technician selection
  const handleTechnicianChange = (bookingId, technicianId) => {
    console.log("📝 Selected:", { bookingId, technicianId });
    setSelectedTechnicians((prev) => ({
      ...prev,
      [bookingId]: technicianId,
    }));
  };

  // Assign technician
  const handleApprove = async (bookingId) => {
    const technicianId = selectedTechnicians[bookingId];

    if (!technicianId) {
      alert("Vui lòng chọn kỹ thuật viên!");
      return;
    }

    try {
      setActionLoading(bookingId);

      const res = await fetch(
        `${API_BASE}/api/staff/bookings/assign-technician`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId, technicianId }),
        }
      );

      if (!res.ok) throw new Error("Assignment failed");

      alert("Phân công thành công!");
      setSelectedTechnicians((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await fetchAppointments();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Decline appointment
  const handleDecline = async (bookingId) => {
    if (!confirm("Từ chối lịch hẹn này?")) return;

    try {
      setActionLoading(bookingId);
      const res = await fetch(
        `${API_BASE}/api/staff/bookings/${bookingId}/decline`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Decline failed");

      alert("Đã từ chối");
      await fetchAppointments();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const map = {
      pending: "Chờ phân công",
      assigned: "Đã phân công",
      in_progress: "Đang thực hiện",
      completed: "Hoàn tất",
      declined: "Đã từ chối",
    };
    return (
      <span className={`status-badge status-${status}`}>
        {map[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar sidebarOpen={true} />
        <main className="main-content">
          <h2>Đang tải...</h2>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar sidebarOpen={true} />
        <main className="main-content">
          <h2>Lỗi: {error}</h2>
          <button onClick={() => window.location.reload()}>🔄 Tải lại</button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar sidebarOpen={true} />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">
            <span>Trang chủ</span> <span>/</span>
            <span className="current">Quản lý lịch hẹn</span>
          </div>
          <div className="header-right">
            {userRole === "admin" ? "Quản trị viên" : "Nhân viên"}
          </div>
        </div>

        <div className="content-area">
          <div className="content-wrapper">
            <div className="page-title-section">
              <h1 className="page-title">Quản lý lịch hẹn & phân công</h1>
              <p className="page-subtitle">
                Theo dõi và xử lý các yêu cầu dịch vụ
              </p>
            </div>

            {/* Bộ lọc trạng thái */}
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ phân công</option>
                <option value="assigned">Đã phân công</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn tất</option>
                <option value="declined">Đã từ chối</option>
              </select>
            </div>

            <div className="table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>ID</th>
                      <th>Ngày</th>
                      <th>Khách hàng</th>
                      <th>Biển số</th>
                      <th>Dòng xe</th>
                      <th style={{ minWidth: "250px" }}>Kỹ thuật viên</th>
                      <th>Trạng thái</th>
                      <th style={{ minWidth: "200px" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(
                        (appt) =>
                          statusFilter === "all" ||
                          appt.status?.toLowerCase() === statusFilter
                      )
                      .map((appt) => (
                        <tr key={appt.bookingId}>
                          <td>
                            <strong>#{appt.bookingId}</strong>
                          </td>
                          <td>
                            {new Date(appt.bookingDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>{appt.customerName}</td>
                          <td>
                            <strong>{appt.vehiclePlate}</strong>
                          </td>
                          <td>{appt.vehicleModel}</td>

                          <td>
                            {appt.status?.toLowerCase() === "pending" ? (
                              <div>
                                <select
                                  value={
                                    selectedTechnicians[appt.bookingId] || ""
                                  }
                                  onChange={(e) =>
                                    handleTechnicianChange(
                                      appt.bookingId,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    fontSize: "14px",
                                    border: "2px solid #007bff",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    outline: "none",
                                  }}
                                >
                                  <option value="">
                                    -- Chọn kỹ thuật viên --
                                  </option>
                                  {technicians.map((tech) => (
                                    <option
                                      key={tech.userId}
                                      value={tech.userId}
                                      style={{ padding: "8px" }}
                                    >
                                      {tech.fullName} 
                                    </option>
                                  ))}
                                </select>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color:
                                      technicians.length > 0
                                        ? "#28a745"
                                        : "#dc3545",
                                    marginTop: "6px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {technicians.length > 0
                                    ? ` ${technicians.length} kỹ thuật viên sẵn sàng`
                                    : " Không có kỹ thuật viên"}
                                </div>
                              </div>
                            ) : (
                              <span>{appt.technicianName || "—"}</span>
                            )}
                          </td>

                          <td>{getStatusBadge(appt.status)}</td>

                          <td>
                            {appt.status?.toLowerCase() === "pending" ? (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  className="btn-action btn-approve"
                                  onClick={() =>
                                    handleApprove(appt.bookingId)
                                  }
                                  disabled={actionLoading === appt.bookingId}
                                >
                                  {actionLoading === appt.bookingId
                                    ? "⏳"
                                    : "Phân công"}
                                </button>
                                <button
                                  className="btn-action btn-decline"
                                  onClick={() =>
                                    handleDecline(appt.bookingId)
                                  }
                                  disabled={actionLoading === appt.bookingId}
                                >
                                  {actionLoading === appt.bookingId
                                    ? "⏳"
                                    : "Từ chối"}
                                </button>
                              </div>
                            ) : (
                              <button className="btn-action btn-view">
                                👁 Xem
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
