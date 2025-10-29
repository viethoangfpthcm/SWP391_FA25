import React, { useState, useEffect } from "react";
import {
    FaChartBar,
    FaChartPie,
    FaChartLine,
    FaSpinner,
    FaExclamationTriangle,
    FaFilter,
    FaStar,
} from "react-icons/fa";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import "./AdminAnalytics.css";

import RevenueChart from "./graphs/RevenueChart.jsx";
import BookingStatsChart from "./graphs/BookingStatsChart.jsx";
import PartsUsageChart from "./graphs/PartsUsageChart.jsx";
import FeedbackGaugeChart from "./graphs/FeedbackGaugeChart.jsx";

export default function AdminAnalytics() {
    const [userInfo, setUserInfo] = useState(null);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCenter, setSelectedCenter] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [revenueData, setRevenueData] = useState(null);
    const [partsData, setPartsData] = useState(null);
    const [bookingStatsData, setBookingStatsData] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
    const token = localStorage.getItem("token");

    // --- Fetch APIs với console.log ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Lỗi API userInfo: ${res.status}`);
            const data = await res.json();
            console.log("User Info:", data);
            setUserInfo({ fullName: data.fullName || "Admin", role: data.role || "Admin" });
        } catch (err) {
            console.error("fetchUserInfo error:", err);
            setError(err.message);
        }
    };

    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Lỗi API centers: ${res.status}`);
            const data = await res.json();
            console.log("Centers:", data);
            setCenters(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("fetchCenters error:", err);
            setError(err.message);
        }
    };

    const fetchRevenueData = async () => {
        try {
            let url = `${API_BASE}/api/admin/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
            if (selectedCenter !== "all") url = `${API_BASE}/api/admin/analytics/revenue/center/${selectedCenter}?month=${selectedMonth}&year=${selectedYear}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Lỗi API revenue: ${res.status}`);
            const data = await res.json();
            console.log("Revenue Data:", data);
            setRevenueData(data);
        } catch (err) {
            console.error("fetchRevenueData error:", err);
            setError(err.message);
        }
    };

    const fetchPartsData = async () => {
        try {
            if (selectedCenter === "all") { setPartsData({ labels: [], counts: [] }); return; }
            const url = `${API_BASE}/api/admin/analytics/parts?centerId=${selectedCenter}&month=${selectedMonth}&year=${selectedYear}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Lỗi API parts: ${res.status}`);
            const data = await res.json();
            console.log("Parts Data:", data);
            setPartsData(data);
        } catch (err) {
            console.error("fetchPartsData error:", err);
            setError(err.message);
        }
    };

    const fetchBookingStatsData = async () => {
        try {
            let url = `${API_BASE}/api/admin/analytics/bookings?month=${selectedMonth}&year=${selectedYear}`;
            if (selectedCenter !== "all") url = `${API_BASE}/api/admin/analytics/bookings/center/${selectedCenter}?month=${selectedMonth}&year=${selectedYear}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Lỗi API bookingStats: ${res.status}`);
            const data = await res.json();
            console.log("Booking Stats Data:", data);
            setBookingStatsData(data);
        } catch (err) {
            console.error("fetchBookingStatsData error:", err);
            setError(err.message);
        }
    };

    const fetchFeedbackData = async () => {
        try {
            if (selectedCenter === "all") { setFeedbackData(null); return; }
            const url = `${API_BASE}/api/admin/analytics/feedbacks/${selectedCenter}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Lỗi API feedback: ${res.status}`);
            const data = await res.json();
            console.log("Feedback Data:", data);
            const avg = data.averageRating ?? data.avgRating ?? data.rating ?? data.score ?? 0;
            const total = data.totalFeedbacks ?? data.count ?? data.total ?? data.feedbackCount ?? 0;
            setFeedbackData({ averageRating: Number(avg), totalFeedbacks: Number(total), raw: data });
        } catch (err) {
            console.error("fetchFeedbackData error:", err);
            setError(err.message);
        }
    };

    // --- useEffects ---
    useEffect(() => {
        if (!token) { navigate("/"); return; }
        setLoading(true);
        Promise.all([fetchUserInfo(), fetchCenters()])
            .catch(err => { setError(err.message); setLoading(false); })
            .finally(() => setLoading(false));
    }, [token, navigate]);

    useEffect(() => {
        if (!userInfo) { if (!loading) setLoading(false); return; }
        setLoading(true); setError(null);
        Promise.all([fetchRevenueData(), fetchPartsData(), fetchBookingStatsData(), fetchFeedbackData()])
            .finally(() => setLoading(false));
    }, [selectedCenter, selectedMonth, selectedYear, userInfo]);

    // --- Render helpers ---
    const renderMonthOptions = () => Array.from({ length: 12 }, (_, i) => (
        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
    ));
    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return [<option key={currentYear} value={currentYear}>Năm {currentYear}</option>];
    };

    if (!userInfo && loading) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content loading-state">
                    <FaSpinner className="spinner" />
                    <p>Đang tải dữ liệu người dùng...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
            <main className="main-content">
                <header className="page-header">
                    <h1><FaChartBar /> Bảng điều khiển & Phân tích</h1>
                    <p>Tổng quan về hiệu suất hoạt động của hệ thống.</p>
                </header>

                {/* BỘ LỌC */}
                <div className="actions-bar analytics-filters">
                    <div className="filter-group">
                        <label htmlFor="monthFilter"><FaFilter /> Tháng:</label>
                        <select id="monthFilter" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} disabled={loading}>
                            {renderMonthOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="yearFilter"><FaFilter /> Năm:</label>
                        <select id="yearFilter" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} disabled={loading}>
                            {renderYearOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="centerFilter"><FaFilter /> Trung tâm:</label>
                        <select id="centerFilter" value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} disabled={loading}>
                            <option value="all">Tất cả trung tâm</option>
                            {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
                        </select>
                    </div>
                </div>

                {error && !loading && <div className="error-message general-error"><FaExclamationTriangle /> {error}</div>}

                {/* BIỂU ĐỒ */}
                <div className="analytics-charts">
                    <div className="chart-box"><RevenueChart chartData={revenueData} /></div>
                    <div className="chart-box"><BookingStatsChart chartData={bookingStatsData} /></div>
                    <div className="chart-box"><PartsUsageChart chartData={partsData} /></div>
                    {selectedCenter !== "all" && <div className="chart-box"><FeedbackGaugeChart feedback={feedbackData} /></div>}
                </div>
            </main>
        </div>
    );
}