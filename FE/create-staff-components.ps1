# Script tạo Staff shared components
$basePath = "D:\SWP391_FA25\FE\src\features\staff\shared"

# 1. BookingFilters.jsx
$bookingFiltersJsx = @'
import React from "react";
import { FaFilter } from "react-icons/fa";
import "./BookingFilters.css";

export default function BookingFilters({ statusFilter, setStatusFilter }) {
  return (
    <div className="actions-bar">
      <div className="filter-group">
        <label htmlFor="statusFilter">
          <FaFilter /> Lọc:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter-select"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="approved">Đã duyệt</option>
          <option value="assigned">Đã phân công</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="paid">Đã thanh toán (Chờ bàn giao)</option>
          <option value="completed">Đã hoàn tất</option>
          <option value="declined">Đã từ chối</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
    </div>
  );
}
'@

$bookingFiltersJsx | Out-File -FilePath "$basePath\BookingFilters.jsx" -Encoding UTF8

Write-Host "✓ Đã tạo BookingFilters.jsx" -ForegroundColor Green
'@
$scriptPath = "D:\SWP391_FA25\FE\create-staff-components.ps1"
$script | Out-File -FilePath $scriptPath -Encoding UTF8
