import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./BookingStatsChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BookingStatsChart({ chartData }) {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu booking.</p>;
    }

    const statusColors = {
        "Completed": ["#22c55e", "#16a34a"],
        "Cancelled": ["#ef4444", "#dc2626"],
        "Pending": ["#facc15", "#eab308"],
        "Approved": ["#3b82f6", "#2563eb"],
        "In Progress": ["#a855f7", "#9333ea"],
        "Declined": ["#94a3b8", "#64748b"],
        "Paid": ["#10b981", "#059669"],
    };

    const defaultColor = ["#6b7280", "#4b5563"];

    const data = {
        labels: chartData.labels,
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
                    color: "#1e293b",
                    font: { size: 14, weight: "600" },
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
