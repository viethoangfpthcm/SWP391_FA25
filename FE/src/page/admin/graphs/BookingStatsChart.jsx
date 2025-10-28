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
        'Completed': ['rgba(34,197,94,0.85)', '#22c55e'],
        'Cancelled': ['rgba(239,68,68,0.85)', '#ef4444'],
        'Pending': ['rgba(251,191,36,0.85)', '#fbbf24'],
        'Approved': ['rgba(59,130,246,0.85)', '#3b82f6'],
        'In Progress': ['rgba(168,85,247,0.85)', '#a855f7'],
        'Declined': ['rgba(148,163,184,0.85)', '#94a3b8'],
        'Paid': ['rgba(16,185,129,0.85)', '#10b981']
    };

    const defaultColor = ['rgba(107,114,128,0.85)', '#6b7280'];

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                data: chartData.counts,
                backgroundColor: chartData.labels.map(l => (statusColors[l] || defaultColor)[0]),
                borderColor: chartData.labels.map(l => (statusColors[l] || defaultColor)[1]),
                borderWidth: 3,
            },
        ],
    };

    const options = { responsive: true, maintainAspectRatio: false };

    return <Pie data={data} options={options} />;
}
