// AdminAnalytics.jsx (FILE HOÀN CHỈNH)
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
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./AdminAnalytics.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import { Chart, registerables, Filler } from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

if (import.meta.env.MODE !== "development") {
    console.log = () => { };
}
Chart.register(...registerables, Filler);

export default function AdminAnalytics() {
    const [userInfo, setUserInfo] = useState(null);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State cho bộ lọc ---
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- State cho dữ liệu 3 charts ---
    const [revenueData, setRevenueData] = useState(null);
    const [partsData, setPartsData] = useState(null);
    const [bookingStatsData, setBookingStatsData] = useState(null);

    // --- Feedback state (mới thêm) ---
    const [feedbackData, setFeedbackData] = useState(null);

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
    const token = localStorage.getItem("token");

    // --- Hàm Fetch Dữ Liệu ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
            const data = await res.json();
            setUserInfo({ 
                fullName: data.fullName || "Admin", 
                role: data.role || "Admin" 
            });
        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin người dùng.");
        }
    };

    const fetchCenters = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/service-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Không thể tải danh sách trung tâm");
            const data = await res.json();
            setCenters(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError("Không thể tải danh sách trung tâm.");
        }
    };

    const fetchRevenueData = async () => {
        setRevenueData(null);
        let url = `${API_BASE}/api/admin/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
        if (selectedCenter !== "all") {
            url = `${API_BASE}/api/admin/analytics/revenue/center/${selectedCenter}?month=${selectedMonth}&year=${selectedYear}`;
        }
        
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                if(res.status === 404) {
                    setRevenueData({ labels: [], revenue: [] });
                    return;
                }
                throw new Error(`Lỗi tải doanh thu (${res.status})`);
            }
            const data = await res.json();
            setRevenueData(data); 
        } catch (err) {
            console.error("fetchRevenueData Error:", err);
            setError("Lỗi tải dữ liệu doanh thu.");
            setRevenueData({ labels: [], revenue: [] });
        }
    };

    const fetchPartsData = async () => {
        setPartsData(null);
        if (selectedCenter === "all") {
            setPartsData({ labels: [], counts: [] });
            return; 
        }
        
        const url = `${API_BASE}/api/admin/analytics/parts?centerId=${selectedCenter}&month=${selectedMonth}&year=${selectedYear}`;
        
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                if(res.status === 404) {
                    setPartsData({ labels: [], counts: [] });
                    return;
                }
                throw new Error(`Lỗi tải linh kiện (${res.status})`);
            }
            const data = await res.json();
            setPartsData(data);
        } catch (err) {
            console.error("fetchPartsData Error:", err);
            setError("Lỗi tải dữ liệu linh kiện.");
            setPartsData({ labels: [], counts: [] });
        }
    };

    const fetchBookingStatsData = async () => {
        setBookingStatsData(null);
        let url = `${API_BASE}/api/admin/analytics/bookings?month=${selectedMonth}&year=${selectedYear}`;
        if (selectedCenter !== "all") {
            url = `${API_BASE}/api/admin/analytics/bookings/center/${selectedCenter}?month=${selectedMonth}&year=${selectedYear}`;
        }

        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                if(res.status === 404) {
                    setBookingStatsData({ labels: [], counts: [] });
                    return;
                }
                throw new Error(`Lỗi tải booking (${res.status})`);
            }
            const data = await res.json();
            setBookingStatsData(data);
        } catch (err) {
            console.error("fetchBookingStatsData Error:", err);
            setError("Lỗi tải dữ liệu booking.");
            setBookingStatsData({ labels: [], counts: [] });
        }
    };

    // --- MỚI: fetch feedback (rating) cho center đang chọn ---
    const fetchFeedbackData = async () => {
        setFeedbackData(null);
        if (selectedCenter === "all") {
            // không lấy feedback khi "all"
            return;
        }
        const url = `${API_BASE}/api/admin/analytics/feedback/${selectedCenter}`;
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                if (res.status === 404) {
                    setFeedbackData(null);
                    return;
                }
                throw new Error(`Lỗi tải feedback (${res.status})`);
            }
            const data = await res.json();
            // Hỗ trợ nhiều tên trường trả về từ API: averageRating | avgRating | rating
            const avg = data.averageRating ?? data.avgRating ?? data.rating ?? data.score ?? null;
            const total = data.totalFeedbacks ?? data.count ?? data.total ?? data.feedbackCount ?? null;
            setFeedbackData({
                averageRating: typeof avg === "number" ? avg : (avg ? Number(avg) : 0),
                totalFeedbacks: typeof total === "number" ? total : (total ? Number(total) : 0),
                raw: data
            });
        } catch (err) {
            console.error("fetchFeedbackData Error:", err);
            setError("Lỗi tải dữ liệu đánh giá.");
            setFeedbackData(null);
        }
    };

    // --- useEffects ---
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        setLoading(true);
        Promise.all([fetchUserInfo(), fetchCenters()])
            .catch(err => {
                setError(err.message);
                setLoading(false);
            })
            .finally(() => {
                // nếu userInfo chưa được set thì fetchUserInfo sẽ set — second useEffect sẽ xử lý tiếp
                setLoading(false);
            });
    }, [token, navigate]);

    useEffect(() => {
        if (!userInfo) {
            if (!loading) setLoading(false);
            return;
        }
        
        console.log("Fetching analytics data...");
        setLoading(true);
        setError(null);

        Promise.all([
            fetchRevenueData(),
            fetchPartsData(),
            fetchBookingStatsData(),
            fetchFeedbackData() // <- gọi fetch feedback cùng lúc
        ]).finally(() => {
            setLoading(false);
        });

    }, [selectedCenter, selectedMonth, selectedYear, userInfo]);

    // --- Helpers ---
    const renderMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
        ));
    };

    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 0; i--) {
            years.push(<option key={i} value={i}>Năm {i}</option>);
        }
        return years;
    };
    
    // --- Render ---
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
                        <select
                            id="monthFilter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            disabled={loading}
                        >
                            {renderMonthOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="yearFilter"><FaFilter /> Năm:</label>
                        <select
                            id="yearFilter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            disabled={loading}
                        >
                            {renderYearOptions()}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="centerFilter"><FaFilter /> Trung tâm:</label>
                        <select
                            id="centerFilter"
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                            disabled={loading}
                        >
                            <option value="all">Tất cả trung tâm</option>
                            {centers.map((center) => (
                                <option key={center.id} value={center.id}>
                                    {center.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && !loading && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* BIỂU ĐỒ */}
                <div className="analytics-grid">
                    {/* Chart 1: Doanh thu */}
                    <div className="chart-card">
                        <h2 className="chart-title"><FaChartLine /> Doanh thu (Tháng {selectedMonth}/{selectedYear})</h2>
                        {loading ? (
                            <div className="chart-placeholder"><FaSpinner className="spinner" /></div>
                        ) : (
                            <RevenueChart chartData={revenueData} />
                        )}
                    </div>
                    
                    {/* Chart 2: Thống kê Booking */}
                    <div className="chart-card">
                        <h2 className="chart-title"><FaChartPie /> Thống kê Booking (Tháng {selectedMonth}/{selectedYear})</h2>
                        {loading ? (
                            <div className="chart-placeholder"><FaSpinner className="spinner" /></div>
                        ) : (
                            <BookingStatsChart chartData={bookingStatsData} />
                        )}
                    </div>

                    {/* Chart 3: Linh kiện */}
                    <div className="chart-card wide-card">
                        <h2 className="chart-title"><FaChartBar /> Linh kiện đã sử dụng (Tháng {selectedMonth}/{selectedYear})</h2>
                        {loading ? (
                            <div className="chart-placeholder"><FaSpinner className="spinner" /></div>
                        ) : selectedCenter === "all" ? (
                            <p className="chart-placeholder">Vui lòng chọn một trung tâm cụ thể để xem thống kê linh kiện.</p>
                        ) : (
                            <PartsUsageChart chartData={partsData} />
                        )}
                    </div>

                    {/* --- MỚI: Gauge Feedback (đặt ngay sau Linh kiện) --- */}
                    {selectedCenter !== "all" && (
                        <div className="chart-card">
                            <h2 className="chart-title"><FaStar /> Đánh giá trung tâm</h2>
                            {loading ? (
                                <div className="chart-placeholder"><FaSpinner className="spinner" /></div>
                            ) : feedbackData ? (
                                <FeedbackGaugeChart feedback={feedbackData} />
                            ) : (
                                <p className="chart-placeholder">Không có dữ liệu đánh giá.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// --- COMPONENT BIỂU ĐỒ ---

// 1. Chart Doanh Thu
function RevenueChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu doanh thu.</p>;
    }

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: chartData.revenue,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            },
        ],
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '600',
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#1f2937',
                    boxWidth: 10,
                    boxHeight: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 16,
                cornerRadius: 10,
                titleFont: {
                    size: 15,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 14
                },
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                    lineWidth: 1
                },
                ticks: {
                    padding: 12,
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    color: '#64748b',
                    callback: function(value, index, values) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Tr';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    }
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    padding: 10,
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    color: '#1e293b',
                    maxRotation: 45,
                    minRotation: 0
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };
    
    const ChartComponent = chartData.labels.length > 1 ? Line : Bar;
    return <ChartComponent data={data} options={options} />;
}

// 2. Chart Thống Kê Booking
function BookingStatsChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu booking.</p>;
    }

    // Map màu sắc chuyên nghiệp
    const statusColors = {
        'Completed': {
            bg: 'rgba(34, 197, 94, 0.85)',
            border: '#22c55e'
        },
        'Cancelled': {
            bg: 'rgba(239, 68, 68, 0.85)',
            border: '#ef4444'
        },
        'Pending': {
            bg: 'rgba(251, 191, 36, 0.85)',
            border: '#fbbf24'
        },
        'Approved': {
            bg: 'rgba(59, 130, 246, 0.85)',
            border: '#3b82f6'
        },
        'In Progress': {
            bg: 'rgba(168, 85, 247, 0.85)',
            border: '#a855f7'
        },
        'Declined': {
            bg: 'rgba(148, 163, 184, 0.85)',
            border: '#94a3b8'
        },
        'Paid': {
            bg: 'rgba(16, 185, 129, 0.85)',
            border: '#10b981'
        }
    };

    const defaultColor = {
        bg: 'rgba(107, 114, 128, 0.85)',
        border: '#6b7280'
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                data: chartData.counts,
                backgroundColor: chartData.labels.map(label => 
                    (statusColors[label] || defaultColor).bg
                ),
                borderColor: chartData.labels.map(label => 
                    (statusColors[label] || defaultColor).border
                ),
                borderWidth: 3,
                hoverOffset: 20,
                hoverBorderWidth: 4,
                hoverBorderColor: '#ffffff'
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '600',
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#1f2937',
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].borderColor[i],
                                    lineWidth: 2,
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 16,
                cornerRadius: 10,
                titleFont: {
                    size: 15,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 14
                },
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} bookings (${percentage}%)`;
                    }
                }
            }
        }
    };

    return <Pie data={data} options={options} />;
}

// 3. Chart Linh kiện (đã thêm filter VF và fix scroll header)
function PartsUsageChart({ chartData }) {
    const [filter, setFilter] = useState("all");

    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu linh kiện.</p>;
    }

    // Lọc linh kiện theo 4 ký tự cuối (VD: "VF 3")
    const filteredIndices = chartData.labels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => {
            if (filter === "all") return true;
            const suffix = label.slice(-4).trim().toUpperCase();
            return suffix === filter;
        });

    const filteredLabels = filteredIndices.map(item => chartData.labels[item.index]);
    const filteredCounts = filteredIndices.map(item => chartData.counts[item.index]);

    return (
        <div className="parts-table-container">
            {/* Bộ lọc VF */}
            <div className="parts-filter">
                <label htmlFor="vfFilter" style={{ marginRight: "8px", fontWeight: "600" }}>
                    Bộ lọc dòng xe (VF):
                </label>
                <select
                    id="vfFilter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontWeight: "500"
                    }}
                >
                    <option value="all">Tất cả</option>
                    <option value="VF 3">VF 3</option>
                    <option value="VF 5">VF 5</option>
                    <option value="VF 7">VF 7</option>
                    <option value="VF 9">VF 9</option>
                </select>
            </div>

            {/* Bảng linh kiện */}
            <div
                className="parts-table-wrapper"
                style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    marginTop: "10px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                }}
            >
                <table className="parts-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 2 }}>
                        <tr>
                            <th
                                style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    borderBottom: "2px solid #e2e8f0",
                                    fontWeight: "700",
                                    color: "#1e293b",
                                    background: "#f8fafc",
                                }}
                            >
                                Thông số linh kiện
                            </th>
                            <th
                                style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    borderBottom: "2px solid #e2e8f0",
                                    fontWeight: "700",
                                    color: "#1e293b",
                                    background: "#f8fafc",
                                }}
                            >
                                Số lượng đã sử dụng
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLabels.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="2"
                                    style={{
                                        textAlign: "center",
                                        padding: "14px",
                                        color: "#999",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    Không có linh kiện phù hợp bộ lọc.
                                </td>
                            </tr>
                        ) : (
                            filteredLabels.map((label, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                                    }}
                                >
                                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                                        {label}
                                    </td>
                                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                                        {filteredCounts[index]}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- MỚI: Feedback Gauge Component ---
// Hiển thị rating trung bình (scale 0-5) dưới dạng gauge (nửa vòng)
function FeedbackGaugeChart({ feedback }) {
    const avg = Number(feedback?.averageRating ?? 0); // 0-5
    // chuyển sang phần trăm (0-100)
    const pct = Math.max(0, Math.min(100, (avg / 5) * 100));
    const remaining = 100 - pct;

    const chartData = {
        datasets: [
            {
                data: [pct, remaining],
                backgroundColor: ['rgba(250,204,21,0.95)', 'rgba(229,231,235,0.8)'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                cutout: '75%',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
    };

    return (
        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', height: 220, position: 'relative' }}>
            <Doughnut data={chartData} options={options} />
            <div style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f59e0b' }}>
                    {avg.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                    /5 ({feedback?.totalFeedbacks ?? 0} lượt)
                </div>
            </div>
        </div>
    );
}
    