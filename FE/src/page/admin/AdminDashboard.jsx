import React, { useState, useEffect } from "react";
import {
  FaUserCog,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";
import "./AdminDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

if (import.meta.env.MODE !== "development") {
  console.log = () => {};
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    centerId: "",
  });
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Fetch current user info
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
      const data = await res.json();
      localStorage.setItem("fullName", data.fullName || "Admin");
      localStorage.setItem("role", data.role || "Admin");
      setUserInfo({ fullName: data.fullName, role: data.role });
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin người dùng.");
    }
  };

  // Fetch danh sách user
  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error(`Lỗi tải danh sách người dùng (${res.status})`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUserInfo();
    fetchUsers();
  }, [token]);

  const filteredUsers =
    filterRole === "all"
      ? users
      : users.filter(
          (u) => u.role && u.role.toLowerCase() === filterRole.toLowerCase()
        );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openForm = (user = null) => {
    setEditingUser(user);
    setShowForm(true);
    if (user) {
      setFormData({
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        centerId: user.centerId || "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        centerId: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const endpoint = editingUser
        ? `${API_BASE}/api/admin/users-update`
        : `${API_BASE}/api/admin/users-create`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error("Không thể lưu thông tin người dùng.");

      await fetchUsers();
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error("Không thể xóa người dùng.");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu người dùng...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />

      <main className="main-content">
        <header className="page-header">
          <h1>
            <FaUserCog /> Quản lý người dùng
          </h1>
          <p>Thêm, chỉnh sửa và quản lý quyền người dùng trong hệ thống.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Bộ lọc và nút thêm */}
        <div className="actions-bar">
          <div className="filter-group">
            <label htmlFor="roleFilter">
              <FaFilter /> Lọc vai trò:
            </label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="technician">Technician</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <button className="btn-add" onClick={() => openForm()}>
            <FaPlus /> Thêm người dùng
          </button>
        </div>

        {/* Bảng danh sách người dùng */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Trung tâm</th>
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
                        <span
                          className={`role-badge role-${user.role?.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.centerName || "—"}</td>
                      <td className="action-buttons-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openForm(user)}
                          disabled={actionLoading}
                        >
                          <FaEdit /> Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(user.userId)}
                          disabled={actionLoading}
                        >
                          <FaTrash /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form thêm / sửa người dùng */}
        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h2>
              <form onSubmit={handleSubmit} className="user-form">
                <label>
                  Họ tên:
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Số điện thoại:
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Vai trò:
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="technician">Technician</option>
                    <option value="customer">Customer</option>
                  </select>
                </label>
                <label>
                  Center ID:
                  <input
                    type="number"
                    name="centerId"
                    value={formData.centerId}
                    onChange={handleChange}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={actionLoading}>
                    {actionLoading ? <FaSpinner className="spinner-icon" /> : <FaSave />}{" "}
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
