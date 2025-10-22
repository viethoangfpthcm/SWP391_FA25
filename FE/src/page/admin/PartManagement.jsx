import React, { useState, useEffect } from "react";
import {
  FaWrench,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import "./AdminDashboard.css"; // Sử dụng lại CSS
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";

// Tắt console.log ở production
if (import.meta.env.MODE !== "development") {
  console.log = () => {};
}

export default function PartManagement() {
  const [parts, setParts] = useState([]);
  const [centerInfo, setCenterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unitPrice: 0,
    laborCost: 0,
    materialCost: 0,
  });

  const [userInfo, setUserInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const { centerId } = useParams(); // Lấy centerId từ URL
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Fetch thông tin trung tâm và danh sách phụ tùng
  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1. Fetch thông tin trung tâm
      const centerRes = await fetch(
        `${API_BASE}/api/admin/service-centers/${centerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (centerRes.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!centerRes.ok)
        throw new Error(`Lỗi tải thông tin trung tâm (${centerRes.status})`);
      const centerData = await centerRes.json();
      setCenterInfo(centerData);

      // 2. Fetch danh sách phụ tùng
      const partsRes = await fetch(
        `${API_BASE}/api/admin/service-centers/${centerId}/parts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (partsRes.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!partsRes.ok)
        throw new Error(`Lỗi tải danh sách phụ tùng (${partsRes.status})`);
      const partsData = await partsRes.json();
      setParts(Array.isArray(partsData) ? partsData : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [token, centerId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Mở form
  const openForm = (part = null) => {
    setEditingPart(part);
    setShowForm(true);
    if (part) {
      setFormData({
        name: part.name,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        laborCost: part.laborCost,
        materialCost: part.materialCost,
      });
    } else {
      setFormData({
        name: "",
        quantity: 0,
        unitPrice: 0,
        laborCost: 0,
        materialCost: 0,
      });
    }
  };

  // Xử lý submit (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = editingPart ? "PUT" : "POST";
      const endpoint = editingPart
        ? `${API_BASE}/api/admin/parts/${editingPart.partId}` // Endpoint cập nhật
        : `${API_BASE}/api/admin/service-centers/${centerId}/parts`; // Endpoint tạo mới

      const body = {
        ...formData,
        // Khi tạo mới, cần gắn serviceCenter. (API update không cần)
        ...(!editingPart && {
          serviceCenter: { id: centerId },
        }),
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error("Không thể lưu thông tin phụ tùng.");

      await fetchData(); // Tải lại dữ liệu
      setShowForm(false);
      setEditingPart(null);
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
        <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu phụ tùng...</p>
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
            <FaWrench /> Quản lý Phụ tùng
          </h1>
          <p>
            Danh sách phụ tùng tại:{" "}
            <strong>{centerInfo?.name || `Trung tâm ID #${centerId}`}</strong>
          </p>
        </header>

        {error && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="actions-bar">
          <button
            className="btn-add"
            style={{ backgroundColor: "#6b7280" }} // Màu xám
            onClick={() => navigate("/admin/service-centers")}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <button className="btn-add" onClick={() => openForm()}>
            <FaPlus /> Thêm phụ tùng
          </button>
        </div>

        {/* Bảng danh sách phụ tùng */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Phụ tùng</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Phí nhân công</th>
                  <th>Phí vật tư</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {parts.length > 0 ? (
                  parts.map((part) => (
                    <tr key={part.partId}>
                      <td>#{part.partId}</td>
                      <td>{part.name}</td>
                      <td>{part.quantity}</td>
                      <td>{part.unitPrice}</td>
                      <td>{part.laborCost}</td>
                      <td>{part.materialCost}</td>
                      <td className="action-buttons-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openForm(part)}
                          disabled={actionLoading}
                        >
                          <FaEdit /> Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      Trung tâm này chưa có phụ tùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form thêm / sửa */}
        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingPart
                  ? "Chỉnh sửa phụ tùng"
                  : "Thêm phụ tùng mới"}
              </h2>
              <form onSubmit={handleSubmit} className="user-form">
                <label>
                  Tên Phụ tùng:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Số lượng:
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Đơn giá:
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Phí nhân công:
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Phí vật tư:
                  <input
                    type="number"
                    name="materialCost"
                    value={formData.materialCost}
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