import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./BookingStatsChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const getVietnameseLabel = (englishLabel) => {
    if (!englishLabel) return "Không rõ";

    const statusMap = {
        "ASSIGNED": "Đã phân công",
        "APPROVED": "Đã duyệt",
        "IN_PROGRESS": "Đang tiến hành",
        "PENDING": "Đang chờ",
        "COMPLETED": "Hoàn thành",
        "PAID": "Đã thanh toán",
        "CANCELLED": "Đã hủy",
        "DECLINED": "Đã từ chối",
    };
    const normalizedLabel = englishLabel.replace(/ /g, "_");

    return statusMap[normalizedLabel] || englishLabel;
};

export default function BookingStatsChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu booking.</p>;
    }

    const statusColors = {
        "Assigned": ["#a855f7", "#9333ea"],     // tím
        "In_Progress": ["#facc15", "#eab308"],  // vàng
        "Approved": ["#14b8a6", "#0d9488"], // xanh ngọc
        "Pending": ["#fb923c", "#f97316"],      // cam
        "Completed": ["#22c55e", "#16a34a"],    // xanh lá
        "Paid": ["#0ea5e9", "#0284c7"],         // xanh cyan
        "Cancelled": ["#ef4444", "#dc2626"],    // đỏ
        "Declined": ["#ef4444", "#dc2626"],     // xám
    };

    const defaultColor = ["#6b7280", "#4b5563"];
    const vietnameseLabels = chartData.labels.map(getVietnameseLabel);
    const data = {
        labels: vietnameseLabels,
        datasets: [
            {
                data: chartData.counts,
                backgroundColor: chartData.labels.map((label) => {
                    const key = label.trim().toLowerCase();
                    const color = Object.entries(statusColors).find(
                        ([status]) => status.toLowerCase() === key
                    );
                    return color ? color[1][0] : defaultColor[0];
                }),
                borderColor: chartData.labels.map((label) => {
                    const key = label.trim().toLowerCase();
                    const color = Object.entries(statusColors).find(
                        ([status]) => status.toLowerCase() === key
                    );
                    return color ? color[1][1] : defaultColor[1];
                }),
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#0f172a",
                    font: { size: 14, weight: "600" },
                    boxWidth: 20,
                    boxHeight: 14,
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: "rectRounded",
                },
            },
        },
    };

    return (
        <div className="booking-chart-container">
            <Pie data={data} options={options} />
        </div>
    );
}
