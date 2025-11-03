import React, { useState, useEffect } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import Sidebar from "@components/layout/Sidebar.jsx";
import { FaCalendarAlt, FaEye } from "react-icons/fa";
import "./BookingManagement.css";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/manager/bookings", {
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

  if (loading) {
    return (
      <div className="booking-management-loading">
        <Loading inline />
      </div>
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
                    <th>Thợ</th>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
