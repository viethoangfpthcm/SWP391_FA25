import React, { useState, useEffect } from "react";
import "./PartsUsageChart.css";
import { API_BASE_URL } from "@config/api.js";

export default function PartsUsageChart({ chartData }) {
    const [filter, setFilter] = useState("all");
    const [vehicleModels, setVehicleModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchVehicleModels = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const role = (localStorage.getItem("role") || "").toUpperCase();
                let endpoint = "";
                if (role === "ADMIN") endpoint = "/api/admin/vehicle-models";
                else if (role === "MANAGER") endpoint = "/api/manager/vehicle-models";
                else if (role === "STAFF") endpoint = "/api/staff/vehicle-models";
                else endpoint = "/api/admin/vehicle-models"; 

                const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Không thể tải danh sách dòng xe.");
                const data = await res.json();
                const uniqueModels = Array.from(new Set(data.map(m => m.trim())));
                setVehicleModels(uniqueModels);
            } catch (err) {
                console.error("Fetch vehicle models error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicleModels();
    }, []);

    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu linh kiện.</p>;
    }
    const filteredIndices = chartData.labels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => {
            if (filter === "all") return true;
            const modelKey = filter.split(" ").slice(-2).join(" ").toUpperCase().trim();
            return label.toUpperCase().includes(modelKey);
        });

    const sortedParts = filteredIndices
        .map(item => ({
            label: chartData.labels[item.index],
            count: chartData.counts[item.index],
        }))
        .sort((a, b) => b.count - a.count);


    return (
        <div className="parts-table-container">
            <div className="parts-filter">
                <label>Bộ lọc dòng xe: </label>

                {loading ? (
                    <span style={{ color: "#64748b", marginLeft: 8 }}>Đang tải...</span>
                ) : error ? (
                    <span style={{ color: "red", marginLeft: 8 }}>{error}</span>
                ) : (
                    <select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {vehicleModels.map((model, i) => (
                            <option key={i} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="parts-table-wrapper">
                <table className="parts-table">
                    <thead>
                        <tr>
                            <th>Linh kiện</th>
                            <th>Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParts.map((part, i) => (
                            <tr key={i}>
                                <td>{part.label}</td>
                                <td>{part.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
