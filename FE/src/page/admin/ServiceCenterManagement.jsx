import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaEye,
} from "react-icons/fa";
import "./AdminDashboard.css"; // Sử dụng lại CSS của AdminDashboard
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";

// Tắt console.log ở production
if (import.meta.env.MODE !== "development") {
  console.log = () => {};
}

export default function ServiceCenterManagement() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // Thông tin user (lấy từ local storage hoặc fetch)
  const [userInfo, setUserInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Fetch danh sách trung tâm
  const fetchCenters = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/service-centers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok)
        throw new Error(`Lỗi tải danh sách trung tâm (${res.status})`);
      const data = await res.json();
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách trung tâm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchCenters();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Mở form để thêm mới hoặc chỉnh sửa
  const openForm = (center = null) => {
    setEditingCenter(center);
    setShowForm(true);
    if (center) {
      setFormData({
        id: center.id,
        name: center.name,
        address: center.address,
        phone: center.phone,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
      });
    }
  };

  // Xử lý submit form (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = editingCenter ? "PUT" : "POST";
      const endpoint = editingCenter
        ? `${API_BASE}/api/admin/service-centers/${editingCenter.id}`
        : `${API_BASE}/api/admin/service-centers`;

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
      if (!res.ok) throw new Error("Không thể lưu thông tin trung tâm.");

      await fetchCenters();
      setShowForm(false);
      setEditingCenter(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Chuyển hướng đến trang quản lý phụ tùng của trung tâm
  const handleViewParts = (centerId) => {
    navigate(`/admin/parts/${centerId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu trung tâm...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />

      <main className="main-content">
        <header className="page-header">
          <h1>
            <FaBuilding /> Quản lý Trung tâm Dịch vụ
          </h1>
          <p>Thêm, chỉnh sửa thông tin các trung tâm bảo dưỡng.</p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="actions-bar">
          <div /> {/* Placeholder cho filter nếu cần */}
          <button className="btn-add" onClick={() => openForm()}>
            <FaPlus /> Thêm trung tâm
          </button>
        </div>

        {/* Bảng danh sách trung tâm */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Trung tâm</th>
                  <th>Địa chỉ</th>
                  <th>SĐT</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {centers.length > 0 ? (
                  centers.map((center) => (
                    <tr key={center.id}>
                      <td>#{center.id}</td>
                      <td>{center.name}</td>
                      <td>{center.address}</td>
                      <td>{center.phone}</td>
                      <td className="action-buttons-cell">
                        <button
                          className="btn-action btn-edit"
                          style={{ backgroundColor: "#10b981" }} // Màu xanh lá
                          onClick={() => handleViewParts(center.id)}
                          disabled={actionLoading}
                        >
                          <FaEye /> Xem Phụ tùng
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openForm(center)}
                          disabled={actionLoading}
                        >
                          <FaEdit /> Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Chưa có trung tâm dịch vụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form thêm / sửa trung tâm */}
        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingCenter
                  ? "Chỉnh sửa trung tâm"
                  : "Thêm trung tâm mới"}
              </h2>
              <form onSubmit={handleSubmit} className="user-form">
                <label>
                  Tên Trung tâm:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Địa chỉ:
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
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

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <FaSpinner className="spinner-icon" />
                    ) : (
                      <FaSave />
                    )}{" "}
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