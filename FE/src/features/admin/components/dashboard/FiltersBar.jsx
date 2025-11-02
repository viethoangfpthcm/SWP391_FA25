import React from 'react';
import { FaFilter, FaPlus } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';

export default function FiltersBar({
  filterRole, setFilterRole,
  filterCenter, setFilterCenter,
  filterActive, setFilterActive,
  centerList = [],
  onAddClick,
  disabled = false,
}) {
  return (
    <div className="actions-bar">
      <div className="filter-group">
        <label htmlFor="roleFilter"><FaFilter /> Lọc vai trò:</label>
        <select id="roleFilter" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="staff">Staff</option>
          <option value="technician">Technician</option>
          <option value="customer">Customer</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="centerFilter">Trung tâm:</label>
        <select id="centerFilter" value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="none">— Không có —</option>
          {centerList.map(centerName => (
            <option key={centerName} value={centerName}>{centerName}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="activeFilter">Trạng thái:</label>
        <select id="activeFilter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="true">Đã kích hoạt</option>
          <option value="false">Chưa kích hoạt</option>
        </select>
      </div>

      <Button className="btn-add" onClick={onAddClick} disabled={disabled}>
        <FaPlus /> Thêm người dùng
      </Button>
    </div>
  );
}
