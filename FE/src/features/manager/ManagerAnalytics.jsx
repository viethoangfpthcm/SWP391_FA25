import React, { useState, useEffect } from "react";
import {
    FaChartBar,
    FaChartPie,
    FaChartLine,
    FaExclamationTriangle,
    FaFilter,
} from "react-icons/fa";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Loading from '@components/ui/Loading.jsx';
import "./ManagerAnalytics.css";

// Import graph components (reuse từ admin)
import RevenueChart from "../admin/graphs/RevenueChart.jsx";
import BookingStatsChart from "../admin/graphs/BookingStatsChart.jsx";
import PartsUsageChart from "../admin/graphs/PartsUsageChart.jsx";
import FeedbackGaugeChart from "../admin/graphs/FeedbackGaugeChart.jsx";
import { API_BASE_URL } from "@config/api.js";

export default function ManagerAnalytics() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [revenueData, setRevenueData] = useState(null);
    const [partsData, setPartsData] = useState(null);
    const [bookingStatsData, setBookingStatsData] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);

    const navigate = useNavigate();
    
    const token = localStorage.getItem("token");

    // --- Fetch User Info ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                navigate("/");
                return;
            }
            const data = await res.json();
            setUserInfo({ 
                fullName: data.fullName || "Manager", 
                role: data.role || "MANAGER",
                centerId: data.centerId || null,
                centerName: data.centerName || "Trung tâm"
            });
        } catch (err) {
            console.error("fetchUserInfo error:", err);
            setError(err.message);
            navigate("/");
        }
    };

    // --- Fetch Revenue Data (Manager Center Only) ---
    const fetchRevenueData = async () => {
        try {
            const url = `${API_BASE_URL}/api/manager/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
            console.log("Fetching revenue from:", url);
            const res = await fetch(url, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!res.ok) {
                console.warn("Revenue API not available:", res.status);
                return;
            }
            const data = await res.json();
            console.log("Revenue data received:", data);
            setRevenueData(data);
        } catch (err) {
            console.error("fetchRevenueData error:", err);
        }
    };

    // --- Fetch Parts Usage Data ---
    const fetchPartsData = async () => {
        try {
            const url = `${API_BASE_URL}/api/manager/analytics/parts?month=${selectedMonth}&year=${selectedYear}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.warn("Parts API not available:", res.status);
                return;
            }
            const data = await res.json();
            setPartsData(data);
        } catch (err) {
            console.error("fetchPartsData error:", err);
        }
    };

    // --- Fetch Booking Stats ---
    const fetchBookingStatsData = async () => {
        try {
            const url = `${API_BASE_URL}/api/manager/analytics/bookings?month=${selectedMonth}&year=${selectedYear}`;
            console.log("Fetching bookings from:", url);
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.warn("Bookings API not available:", res.status);
                return;
            }
            const data = await res.json();
            console.log("Bookings data received:", data);
            setBookingStatsData(data);
        } catch (err) {
            console.error("fetchBookingStatsData error:", err);
        }
    };

    // --- Fetch Feedback Data ---
    const fetchFeedbackData = async () => {
        try {
            const url = `${API_BASE_URL}/api/manager/analytics/feedbacks`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.warn("Feedback API not available:", res.status);
                return;
            }
            const data = await res.json();
            setFeedbackData(data);
        } catch (err) {
            console.error("fetchFeedbackData error:", err);
        }
    };

    // --- useEffects ---
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchUserInfo();
    }, [token, navigate]);

    useEffect(() => {
        if (!userInfo) return;
        
        setLoading(true);
        setError(null);
        
        // Promise.allSettled để các API fail độc lập không ảnh hưởng nhau
        Promise.allSettled([
            fetchRevenueData(),
            fetchPartsData(),
            fetchBookingStatsData(),
            fetchFeedbackData()
        ]).finally(() => setLoading(false));
    }, [selectedMonth, selectedYear, userInfo]);

    // --- Render helpers ---
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

    if (!userInfo && loading) {
        return (
            <div className="admin-dashboard-container">
                <Sidebar />
                <main className="admin-main-content">
                    <Loading inline />
                    <p>Đang tải dữ liệu...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <Sidebar 
                userName={userInfo?.fullName} 
                userRole={userInfo?.role}
            />
            <main className="admin-main-content">
                <header className="admin-header">
                    <h1>
                        <FaChartBar /> Phân tích & Báo cáo
                    </h1>
                    <p>
                        Tổng quan hiệu suất hoạt động của {userInfo?.centerName || "trung tâm"}
                    </p>
                </header>

                {/* BỘ LỌC THÁNG/NĂM */}
                <div className="analytics-filters">
                    <div className="filter-group">
                        <label htmlFor="monthFilter">
                            <FaFilter /> Tháng:
                        </label>
                        <select 
                            id="monthFilter" 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(Number(e.target.value))} 
                            disabled={loading}
                        >
                            {renderMonthOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="yearFilter">
                            <FaFilter /> Năm:
                        </label>
                        <select 
                            id="yearFilter" 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))} 
                            disabled={loading}
                        >
                            {renderYearOptions()}
                        </select>
                    </div>
                </div>

                {error && !loading && (
                    <div className="error-message">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* BIỂU ĐỒ */}
                <div className="admin-content">
                    <div className="analytics-charts">
                        <div className="chart-box">
                            <RevenueChart chartData={revenueData} />
                        </div>
                        <div className="chart-box">
                            <BookingStatsChart chartData={bookingStatsData} />
                        </div>
                        <div className="chart-box">
                            <PartsUsageChart chartData={partsData} />
                        </div>
                        <div className="chart-box">
                            <FeedbackGaugeChart feedback={feedbackData} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
