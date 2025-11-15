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
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";
import { API_BASE_URL } from "@config/api.js";
import "./AdminAnalytics.css";


import RevenueChart from "./graphs/RevenueChart.jsx";
import BookingStatsChart from "./graphs/BookingStatsChart.jsx";
import PartsUsageChart from "./graphs/PartsUsageChart.jsx";
import FeedbackGaugeChart from "./graphs/FeedbackGaugeChart.jsx";
import Loading from '@components/ui/Loading.jsx';

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
    const token = localStorage.getItem("token");

    // Hook Loading
    const showLoading = useMinimumDelay(loading, 1000);

    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Lỗi API userInfo: ${res.status}`);
            const data = await res.json();
            setUserInfo({ fullName: data.fullName || "Admin", role: data.role || "Admin" });
        } catch (err) {
            console.error("fetchUserInfo error:", err);
            setError(err.message);
        }
    };

    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Lỗi API centers: ${res.status}`);
            const data = await res.json();
            setCenters(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("fetchCenters error:", err);
            setError(err.message);
        }
    };

    const fetchRevenueData = async () => {
        try {
            let url;
            if (selectedCenter === "all") {
                url = `${API_BASE_URL}/api/admin/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
            } else {
                const centerId = Number(selectedCenter);
                url = `${API_BASE_URL}/api/admin/analytics/revenue/center/${centerId}?month=${selectedMonth}&year=${selectedYear}`;
            }
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Lỗi API revenue: ${res.status}`);
            const data = await res.json();
            setRevenueData(data);
        } catch (err) {
            console.error("fetchRevenueData error:", err);
            setRevenueData(null);
        }
    };

    const fetchPartsData = async () => {
        try {
            if (selectedCenter === "all") {
                setPartsData({ labels: [], counts: [] });
                return;
            }
            const centerId = Number(selectedCenter);
            const url = `${API_BASE_URL}/api/admin/analytics/parts?centerId=${centerId}&month=${selectedMonth}&year=${selectedYear}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                setPartsData({ labels: [], counts: [] });
                return;
            }
            const data = await res.json();
            setPartsData(data);
        } catch (err) {
            console.error("fetchPartsData error:", err);
            setPartsData({ labels: [], counts: [] });
        }
    };

    const fetchBookingStatsData = async () => {
        try {
            const centerId = selectedCenter !== "all" ? Number(selectedCenter) : null;
            const url = `${API_BASE_URL}/api/admin/analytics/bookings?month=${selectedMonth}&year=${selectedYear}${centerId ? `&centerId=${centerId}` : ''}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                console.error("Bookings API failed:", res.status);
                setBookingStatsData({ labels: [], counts: [] });
                return;
            }
            const data = await res.json();
            setBookingStatsData(data);
        } catch (err) {
            console.error("fetchBookingStatsData error:", err);
            setBookingStatsData({ labels: [], counts: [] });
        }
    };

    const fetchFeedbackData = async () => {
        try {
            if (selectedCenter === "all") {
                setFeedbackData(null);
                return;
            }
            const centerId = Number(selectedCenter);
            const url = `${API_BASE_URL}/api/admin/analytics/feedbacks?centerId=${centerId}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                setFeedbackData(null);
                return;
            }
            const data = await res.json();
            const avg = data.averageRating ?? data.avgRating ?? data.rating ?? data.score ?? 0;
            const total = data.totalFeedbacks ?? data.count ?? data.total ?? data.feedbackCount ?? 0;
            setFeedbackData({ averageRating: Number(avg), totalFeedbacks: Number(total), raw: data });
        } catch (err) {
            console.error("fetchFeedbackData error:", err);
            setFeedbackData(null);
        }
    };

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

    const renderMonthOptions = () => Array.from({ length: 12 }, (_, i) => (
        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
    ));
    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return [<option key={currentYear} value={currentYear}>Năm {currentYear}</option>];
    };

   if (showLoading) {
    return (
      <Loading text="Đang tải thống kê..." />
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
                        <select id="monthFilter" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} disabled={showLoading}>
                            {renderMonthOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="yearFilter"><FaFilter /> Năm:</label>
                        <select id="yearFilter" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} disabled={showLoading}>
                            {renderYearOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="centerFilter"><FaFilter /> Trung tâm:</label>
                        <select id="centerFilter" value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} disabled={showLoading}>
                            <option value="all">Tất cả trung tâm</option>
                            {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
                        </select>
                    </div>
                </div>

                {error && !showLoading && <div className="error-message general-error"><FaExclamationTriangle /> {error}</div>}

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
