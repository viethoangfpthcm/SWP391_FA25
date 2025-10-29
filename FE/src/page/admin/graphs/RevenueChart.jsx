import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./RevenueChart.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function RevenueChart({ chartData }) {
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
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    };

    const ChartComponent = chartData.labels.length > 1 ? Line : Bar;
    return <ChartComponent data={data} options={options} />;
}
