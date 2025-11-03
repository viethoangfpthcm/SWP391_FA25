import React, { useState } from "react";
import "./PartsUsageChart.css";

export default function PartsUsageChart({ chartData }) {
    const [filter, setFilter] = useState("all");

    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <p className="chart-placeholder">Không có dữ liệu linh kiện.</p>;
    }

    const filteredIndices = chartData.labels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => filter === "all" || label.slice(-4).trim().toUpperCase() === filter);

    const filteredLabels = filteredIndices.map(item => chartData.labels[item.index]);
    const filteredCounts = filteredIndices.map(item => chartData.counts[item.index]);

    return (
        <div className="parts-table-container">
            <div className="parts-filter">
                <label>Bộ lọc dòng xe (VF): </label>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="VF 3">VF 3</option>
                    <option value="VF 5">VF 5</option>
                    <option value="VF 7">VF 7</option>
                    <option value="VF 9">VF 9</option>
                </select>
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
                        {filteredLabels.length === 0 ? (
                            <tr>
                                <td colSpan="2" style={{ textAlign: "center" }}>Không có linh kiện phù hợp.</td>
                            </tr>
                        ) : (
                            filteredLabels.map((label, i) => (
                                <tr key={i}>
                                    <td>{label}</td>
                                    <td>{filteredCounts[i]}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
