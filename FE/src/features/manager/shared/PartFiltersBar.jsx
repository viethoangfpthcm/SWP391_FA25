import React from "react";
import "./PartFiltersBar.css";

export default function PartFiltersBar({ filterStatus, setFilterStatus }) {
  return (
    <div className="part-filters-bar">
      <div className="filter-group">
        <label>Trạng thái kho:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="in-stock">Còn hàng (&gt; 10)</option>
          <option value="low-stock">Sắp hết (1-10)</option>
          <option value="out-of-stock">Hết hàng (0)</option>
        </select>
      </div>
    </div>
  );
}
