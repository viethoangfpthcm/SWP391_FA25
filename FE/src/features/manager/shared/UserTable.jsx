import React from "react";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";
import "./UserTable.css";

export default function UserTable({ users, loading }) {
  const getRoleBadge = (role) => {
    const badges = {
      STAFF: { text: "Nhân viên", className: "badge-staff" },
      TECHNICIAN: { text: "Kỹ thuật viên", className: "badge-tech" },
      CUSTOMER: { text: "Khách hàng", className: "badge-customer" },
    };
    return badges[role] || { text: role, className: "badge-default" };
  };

  if (users.length === 0) {
    return (
      <div className="no-users">
        <FaUser size={48} />
        <p>Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const badge = getRoleBadge(user.role);
            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="user-name">
                  <div className="user-avatar">
                    {user.fullName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  {user.fullName}
                </td>
                <td>{user.email}</td>
                <td>{user.phone || "N/A"}</td>
                <td>
                  <span className={`role-badge ${badge.className}`}>
                    {badge.text}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}