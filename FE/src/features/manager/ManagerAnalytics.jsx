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
    const API_BASE = "";
    const token = localStorage.getItem("token");

    // --- Fetch User Info ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
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
            // TODO: API endpoint cho manager analytics
            // const url = `${API_BASE}/api/manager/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
            // const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            // if (!res.ok) throw new Error(`Lỗi API revenue: ${res.status}`);
            // const data = await res.json();
            
            // Mock data cho demo
            const mockData = {
                labels: Array.from({ length: 30 }, (_, i) => `${i + 1}/${selectedMonth}`),
                values: Array.from({ length: 30 }, () => Math.random() * 10000000 + 5000000)
            };
            setRevenueData(mockData);
        } catch (err) {
            console.error("fetchRevenueData error:", err);
            setError(err.message);
        }
    };

    // --- Fetch Parts Usage Data ---
    const fetchPartsData = async () => {
        try {
            // TODO: API endpoint
            // const url = `${API_BASE}/api/manager/analytics/parts?month=${selectedMonth}&year=${selectedYear}`;
            
            // Mock data
            const mockData = {
                labels: ["Ắc quy", "Lọc gió", "Dầu động cơ", "Phanh", "Lốp xe"],
                counts: [45, 32, 78, 23, 15]
            };
            setPartsData(mockData);
        } catch (err) {
            console.error("fetchPartsData error:", err);
            setError(err.message);
        }
    };

    // --- Fetch Booking Stats ---
    const fetchBookingStatsData = async () => {
        try {
            // TODO: API endpoint
            // const url = `${API_BASE}/api/manager/analytics/bookings?month=${selectedMonth}&year=${selectedYear}`;
            
            // Mock data
            const mockData = {
                labels: ["Hoàn thành", "Đang xử lý", "Chờ duyệt", "Đã hủy"],
                counts: [45, 12, 8, 3]
            };
            setBookingStatsData(mockData);
        } catch (err) {
            console.error("fetchBookingStatsData error:", err);
            setError(err.message);
        }
    };

    // --- Fetch Feedback Data ---
    const fetchFeedbackData = async () => {
        try {
            // TODO: API endpoint
            // const url = `${API_BASE}/api/manager/analytics/feedbacks`;
            
            // Mock data
            const mockData = {
                averageRating: 4.3,
                totalFeedbacks: 127
            };
            setFeedbackData(mockData);
        } catch (err) {
            console.error("fetchFeedbackData error:", err);
            setError(err.message);
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
        
        Promise.all([
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
