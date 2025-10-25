// AdminAnalytics.jsx (FILE HOÀN CHỈNH)
import React, { useState, useEffect } from "react";
import {
    FaChartBar,
    FaChartPie,
    FaChartLine,
    FaSpinner,
    FaExclamationTriangle,
    FaFilter,
} from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
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
import "./AdminAnalytics.css"; // Ông cần tạo file CSS này
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
    const token = localStorage.getItem("token");

    // --- Hàm Fetch Dữ Liệu (ĐÃ ĐIỀN ĐỦ) ---
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
            // Lưu vào state để hiển thị, không cần lưu localStorage ở đây
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

    // --- HÀM FETCH DỮ LIỆU CHO CÁC BIỂU ĐỒ ---
    // NHẮC LẠI: Đây là các API MỚI mà Backend của ông phải cung cấp

    // 1. API cho Doanh thu (Chart 1)
    const fetchRevenueData = async () => {
        setRevenueData(null); // Reset
        let url = `${API_BASE}/api/admin/analytics/revenue?month=${selectedMonth}&year=${selectedYear}`;
        if (selectedCenter !== "all") {
            url = `${API_BASE}/api/admin/analytics/revenue/center/${selectedCenter}?month=${selectedMonth}&year=${selectedYear}`;
        }
        
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                 // Nếu 404 là không có data, không phải lỗi
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
            setRevenueData({ labels: [], revenue: [] }); // Set rỗng khi lỗi
        }
    };

    // 2. API cho Thống kê linh kiện (Chart 2)
    const fetchPartsData = async () => {
        setPartsData(null); // Reset
        if (selectedCenter === "all") {
            setPartsData({ labels: [], counts: [] }); // Reset và thoát
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
            setPartsData({ labels: [], counts: [] }); // Set rỗng khi lỗi
        }
    };

    // 3. API cho Thống kê Booking (Chart 3)
    const fetchBookingStatsData = async () => {
        setBookingStatsData(null); // Reset
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
            setBookingStatsData({ labels: [], counts: [] }); // Set rỗng khi lỗi
        }
    };

    // --- useEffects ---
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        setLoading(true);
        // Tải thông tin user và trung tâm trước
        Promise.all([fetchUserInfo(), fetchCenters()])
            .catch(err => {
                setError(err.message);
                // Dù lỗi vẫn set Loading false
                setLoading(false);
            });
            // không set loading false ở đây, để useEffect dưới xử lý
    }, [token, navigate]);

    // useEffect này sẽ chạy khi bộ lọc thay đổi HOẶC khi userInfo đã tải xong
    useEffect(() => {
        if (!userInfo) {
             // Nếu chưa có userInfo (đang tải ở useEffect trên), thì chưa làm gì cả
             // Hoặc nếu useEffect trên lỗi, userInfo sẽ null, cũng dừng
            if (!loading) setLoading(false); // Đảm bảo tắt loading nếu useEffect trên xong
            return;
        }
        
        console.log("Fetching analytics data...");
        setLoading(true);
        setError(null); // Xóa lỗi cũ

        Promise.all([
            fetchRevenueData(),
            fetchPartsData(),
            fetchBookingStatsData()
        ]).finally(() => {
            setLoading(false); // Tắt loading sau khi CẢ 3 API hoàn thành
        });

    }, [selectedCenter, selectedMonth, selectedYear, userInfo]); // Chạy lại khi bộ lọc thay đổi HOẶC khi userInfo có

    // --- Helpers để tạo Options cho Bộ lọc ---
    const renderMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
        ));
    };

    const renderYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(<option key={i} value={i}>Năm {i}</option>);
        }
        return years;
    };
    
    // --- Render ---
    // Trạng thái loading ban đầu khi chưa có userInfo
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

                {/* --- BỘ LỌC CHUNG --- */}
                <div className="actions-bar analytics-filters">
                    <div className="filter-group">
                        <label htmlFor="monthFilter"><FaFilter /> Tháng:</label>
                        <select
                            id="monthFilter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            disabled={loading} // Vô hiệu hóa khi đang tải
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
                            disabled={loading} // Vô hiệu hóa khi đang tải
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
                            disabled={loading} // Vô hiệu hóa khi đang tải
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

                {/* Hiển thị lỗi chung nếu có */}
                 {error && !loading && (
                    <div className="error-message general-error">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* --- KHU VỰC BIỂU ĐỒ --- */}
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
                </div>
            </main>
        </div>
    );
}

// --- CÁC COMPONENT BIỂU ĐỒ CON ---

// 1. Chart Doanh Thu (Biểu đồ đường hoặc cột)
function RevenueChart({ chartData }) {
    // Kiểm tra chartData có tồn tại và có dữ liệu không
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu doanh thu.</p>;
    }

    const data = {
        labels: chartData.labels, // Ví dụ: ["Center A", "Center B"] hoặc ["Tuần 1", "Tuần 2"]
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: chartData.revenue, // Ví dụ: [10000000, 20000000]
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: true,
            },
        ],
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
             y: {
                ticks: {
                    // Định dạng tiền tệ cho trục Y
                    callback: function(value, index, values) {
                         if (value >= 1000000) return (value / 1000000) + ' Tr';
                         if (value >= 1000) return (value / 1000) + ' k';
                        return value;
                    }
                }
            }
        }
    };
    
    // Nếu data chỉ có 1 điểm (VD: xem 1 center), dùng Bar chart
    // Nếu có nhiều điểm (VD: xem all center), dùng Line chart
    const ChartComponent = chartData.labels.length > 1 ? Line : Bar;

    return <ChartComponent data={data} options={options} />;
}

// 2. Chart Thống Kê Booking (Biểu đồ tròn)
function BookingStatsChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu booking.</p>;
    }

    // Map tên trạng thái sang màu sắc
    const statusColors = {
        'Completed': 'rgba(75, 192, 192, 0.6)',
        'Cancelled': 'rgba(255, 99, 132, 0.6)',
        'Pending': 'rgba(255, 206, 86, 0.6)',
        'Approved': 'rgba(54, 162, 235, 0.6)',
        'In Progress': 'rgba(153, 102, 255, 0.6)',
        'Declined': 'rgba(201, 203, 207, 0.6)',
        'Paid': 'rgba(46, 204, 113, 0.6)'
        // Thêm các trạng thái khác nếu có
    };

    const data = {
        labels: chartData.labels, // Ví dụ: ['Completed', 'Cancelled', 'Pending']
        datasets: [
            {
                data: chartData.counts, // Ví dụ: [50, 10, 5]
                backgroundColor: chartData.labels.map(label => statusColors[label] || 'rgba(100, 100, 100, 0.6)'), // Lấy màu theo label
            },
        ],
    };

    return <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
}

// 3. Chart Linh kiện (Biểu đồ cột)
function PartsUsageChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu linh kiện.</p>;
    }

    const data = {
        labels: chartData.labels, // Ví dụ: ['Bugie', 'Lọc gió', 'Dầu nhớt']
        datasets: [
            {
                label: 'Số lượng sử dụng',
                data: chartData.counts, // Ví dụ: [100, 50, 80]
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
        ],
    };
    
    const options = { 
        responsive: true, 
        maintainAspectRatio: false, 
        indexAxis: 'y', // 'y' để làm biểu đồ cột ngang
        scales: {
             x: {
                ticks: {
                    // Đảm bảo trục X bắt đầu từ 0 và là số nguyên
                    beginAtZero: true,
                    stepSize: 1 
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
}