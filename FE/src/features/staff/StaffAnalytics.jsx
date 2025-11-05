import React, { useState, useEffect } from "react";
import { FaChartLine, FaExclamationTriangle, FaCalendarAlt, FaFilter, FaEye } from "react-icons/fa";
import Sidebar from "@components/layout/Sidebar.jsx";
import Loading from "@components/ui/Loading.jsx";
import RevenueChart from "@features/admin/graphs/RevenueChart.jsx";
import BookingStatsChart from "@features/admin/graphs/BookingStatsChart.jsx";
import PartsUsageChart from "@features/admin/graphs/PartsUsageChart.jsx";
import FeedbackGaugeChart from "@features/admin/graphs/FeedbackGaugeChart.jsx";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";
import "./StaffAnalytics.css";
import { API_BASE_URL } from "@config/api.js";

const StaffAnalytics = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [revenueData, setRevenueData] = useState(null);
  const [partsData, setPartsData] = useState(null);
  const [bookingStatsData, setBookingStatsData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Use minimum delay hook for better UX (show loading for at least 1 second)
  const showLoading = useMinimumDelay(loading, 1000);

  const API_BASE = API_BASE_URL;
  const token = localStorage.getItem("token");

  // Fetch user info on mount ONLY
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserInfo(parsed);
      } catch (err) {
        console.error("Error parsing user info:", err);
      }
    }
  }, []); // EMPTY dependency - chỉ chạy 1 lần khi mount
  
  // Fetch analytics when filters change (bao gồm cả lần đầu mount)
  useEffect(() => {
    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]); // Chỉ khi filter thay đổi

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    // Safety timeout: force stop loading sau 5 giây
    const timeout = setTimeout(() => {
      console.warn("Analytics loading timeout - forcing stop");
      setLoading(false);
    }, 5000);
    
    try {
      await Promise.allSettled([
        fetchRevenueData(),
        fetchPartsData(),
        fetchBookingStatsData(),
        fetchFeedbackData(),
      ]);
    } catch (err) {
      console.error("fetchAllAnalytics error:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      console.error("fetchRevenueData error:", err);
    }
  };

  const fetchPartsData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/parts?year=${selectedYear}&month=${selectedMonth}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPartsData(data);
    } catch (err) {
      console.error("fetchPartsData error:", err);
    }
  };

  const fetchBookingStatsData = async () => {
    try {
      const url = `${API_BASE}/api/staff/analytics/bookings?month=${selectedMonth}&year=${selectedYear}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
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
      if (!res.ok) return;
      const data = await res.json();
      setFeedbackData(data);
    } catch (err) {
      console.error("fetchFeedbackData error:", err);
    }
  };

  // Render helpers
  const renderMonthOptions = () => Array.from({ length: 12 }, (_, i) => (
    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
  ));

  const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => {
      const year = currentYear - i;
      return <option key={year} value={year}>Năm {year}</option>;
    });
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
            <FaEye /> Chế độ xem - Chỉ đọc
          </p>
        </header>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <label>
              <FaFilter /> Tháng:
            </label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="filter-select"
            >
              {renderMonthOptions()}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarAlt /> Năm:
            </label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="filter-select"
            >
              {renderYearOptions()}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {showLoading ? (
          <div className="loading-container">
            <Loading />
            <p>Đang tải dữ liệu thống kê...</p>
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-card full-width">
              <h2>Doanh thu</h2>
              {revenueData && revenueData.revenue?.length > 0 ? (
                <RevenueChart chartData={revenueData} />
              ) : (
                <p className="no-data">Không có dữ liệu doanh thu</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Thống kê booking</h2>
              {bookingStatsData && bookingStatsData.counts?.length > 0 ? (
                <BookingStatsChart chartData={bookingStatsData} />
              ) : (
                <p className="no-data">Không có dữ liệu booking</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Phụ tùng sử dụng</h2>
              {partsData && partsData.counts?.length > 0 ? (
                <PartsUsageChart chartData={partsData} />
              ) : (
                <p className="no-data">Không có dữ liệu phụ tùng</p>
              )}
            </div>

            <div className="analytics-card">
              <h2>Đánh giá feedback</h2>
              {feedbackData ? (
                <FeedbackGaugeChart chartData={feedbackData} />
              ) : (
                <p className="no-data">Không có dữ liệu feedback</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffAnalytics;
