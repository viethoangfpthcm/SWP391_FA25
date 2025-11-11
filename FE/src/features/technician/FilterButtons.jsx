import React from "react";
import Button from "@components/ui/Button.jsx";

export default function FilterButtons({ summary, filterStatus, onFilterChange }) {
  const filters = [
    ["all", "Tất cả", summary.total],
    ["pending", "Chờ xử lý", summary.pending],
    ["in-progress", "Đang thực hiện", summary.inProgress],
    ["completed", "Hoàn thành", summary.completed],
  ];

  return (
    <div className="filter-buttons">
      {filters.map(([key, label, count]) => (
        <Button
          key={key}
          className={`filter-btn ${filterStatus === key ? "active" : ""}`}
          onClick={() => onFilterChange(key)}
        >
          {label} ({count})
        </Button>
      ))}
    </div>
  );
}
