import React from "react";
import "./UserFiltersBar.css";

export default function UserFiltersBar({
  filterRole,
  setFilterRole,
  filterActive,
  setFilterActive,
}) {
  return (
    <div className="user-filters-bar">
      <div className="filter-group">
        <label>Vai trò:</label>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="STAFF">Nhân viên</option>
          <option value="TECHNICIAN">Kỹ thuật viên</option>

        </select>
      </div>

      <div className="filter-stats">
        <span>Hiển thị: <strong>{filterRole === "all" ? "Tất cả" : filterRole}</strong></span>
      </div>
    </div>
  );
}
