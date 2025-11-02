import React, { useEffect, useState } from "react";
import "./ManagerAnalytics.css";

const ManagerAnalytics = () => {
  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch("/api/manager/bookings", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/manager/payment", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/manager/parts", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([bookings, payments, parts]) => {
      setStats({
        totalBookings: bookings.length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        totalParts: parts.length,
      });
    });
  }, []);

  return (
    <div className="manager-analytics">
      <h2>Phân tích trung tâm</h2>
      <div className="stats-grid">
        <div className="card">
          <h3>Đặt lịch</h3>
          <p>{stats.totalBookings}</p>
        </div>
        <div className="card">
          <h3>Tổng doanh thu</h3>
          <p>{stats.totalRevenue?.toLocaleString()} VNĐ</p>
        </div>
        <div className="card">
          <h3>Linh kiện</h3>
          <p>{stats.totalParts}</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
