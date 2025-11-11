import React from 'react';
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';

export default function UserTable({
  filteredUsers = [],
  loading = false,
  actionLoading = false,
  isDeleting = false,
  isToggling = false,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <div className="table-card">
      {(loading && filteredUsers.length > 0) && <div className="table-loading-overlay"><Loading inline /> Đang tải lại...</div>}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Họ tên</th><th>Email</th><th>SĐT</th>
              <th>Vai trò</th><th>Trung tâm</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>#{user.userId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>{user.centerName || "—"}</td>
                  <td>
                    {(user.role !== 'ADMIN') ? (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={!!user.isActive}
                          onChange={() => onToggleActive(user)}
                          disabled={actionLoading || isDeleting || isToggling}
                        />
                        <span className="slider"></span>
                      </label>
                    ) : '—'}
                  </td>
                  <td className="action-buttons-cell">
                    <Button className="btn-action btn-edit" onClick={() => onEdit(user)} disabled={actionLoading || isDeleting || isToggling}>
                      Sửa
                    </Button>
                    <Button className="btn-action btn-delete" onClick={() => onDelete(user.userId)} disabled={actionLoading || isDeleting || isToggling}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state-row">
                  {loading ? "Đang tải..." : "Không có người dùng nào phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
