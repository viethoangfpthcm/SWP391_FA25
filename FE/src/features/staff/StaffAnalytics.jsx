import React, { useState, useEffect } from "react";
import { FaChartLine, FaExclamationTriangle, FaCalendarAlt, FaFilter } from "react-icons/fa";
import Sidebar from "@components/layout/Sidebar.jsx";
import Loading from "@components/ui/Loading.jsx";
import RevenueChart from "@features/admin/graphs/RevenueChart.jsx";
import BookingStatsChart from "@features/admin/graphs/BookingStatsChart.jsx";
import PartsUsageChart from "@features/admin/graphs/PartsUsageChart.jsx";
import FeedbackGaugeChart from "@features/admin/graphs/FeedbackGaugeChart.jsx";
import "./StaffAnalytics.css";

const StaffAnalytics = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [revenueData, setRevenueData] = useState(null);
  const [partsData, setPartsData] = useState(null);
  const [bookingStatsData, setBookingStatsData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  const API_BASE = "";
  const token = localStorage.getItem("token");

  // Fetch user info on mount (1 lần duy nhất)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserInfo(parsed);
      } catch (err) {
        console.error("Error parsing user info:", err);
        setLoading(false); // Set false nếu parse lỗi
      }
    } else {
      // Nếu không có user, vẫn cho hiển thị trang với data rỗng
      setLoading(false);
    }
    
    // Safety timeout: force stop loading sau 2 giây
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []); // Chỉ fetch user info 1 lần
  
  // Fetch analytics chỉ khi đã có userInfo (tránh fetch 2 lần do React Strict Mode)
  useEffect(() => {
    if (!userInfo) return;
    
    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]); // Chỉ fetch khi đã có userInfo

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    // Fetch all analytics independently - don't fail all if one fails
    await Promise.allSettled([
      fetchRevenueData(),
      fetchPartsData(),
      fetchBookingStatsData(),
      fetchFeedbackData(),
    ]);
    
    setLoading(false);
  };

  const fetchRevenueData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/revenue`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Lỗi API revenue: ${res.status}`);
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      console.error("fetchRevenueData error:", err);
      // Không set error để không hiển thị lỗi cho user
    }
  };

  const fetchPartsData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/parts`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Lỗi API parts: ${res.status}`);
      const data = await res.json();
      setPartsData(data);
    } catch (err) {
      console.error("fetchPartsData error:", err);
    }
  };

  const fetchBookingStatsData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/bookings`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Lỗi API bookingStats: ${res.status}`);
      const data = await res.json();
      setBookingStatsData(data);
    } catch (err) {
      console.error("fetchBookingStatsData error:", err);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/feedbacks`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Lỗi API feedback: ${res.status}`);
      const data = await res.json();
      setFeedbackData(data);
    } catch (err) {
      console.error("fetchFeedbackData error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="main-content">
        <header className="page-header">
          <h1>
            <FaChartLine /> Thống kê & Báo cáo
          </h1>
          <p className="read-only-badge">
            <FaCalendarAlt /> Chế độ xem - Chỉ đọc
          </p>
        </header>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <Loading />
            <p>Đang tải dữ liệu thống kê...</p>
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-card full-width">
              <h2>Doanh thu</h2>
              {revenueData ? (
                <RevenueChart chartData={revenueData} />
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Thống kê booking</h2>
              {bookingStatsData ? (
                <BookingStatsChart chartData={bookingStatsData} />
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Phụ tùng sử dụng</h2>
              {partsData ? (
                <PartsUsageChart chartData={partsData} />
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Đánh giá feedback</h2>
              {feedbackData ? (
                <FeedbackGaugeChart chartData={feedbackData} />
              ) : (
                <p className="no-data">Không có dữ liệu</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffAnalytics;
