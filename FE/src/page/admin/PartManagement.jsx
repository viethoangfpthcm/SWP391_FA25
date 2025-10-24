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
import "./AdminDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";

if (import.meta.env.MODE !== "development") {
  console.log = () => {};
}

export default function PartManagement() {
  const [parts, setParts] = useState([]);
  const [centerInfo, setCenterInfo] = useState(null);
  const [partTypes, setPartTypes] = useState([]);
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
    partTypeId: "",
  });

  const [userInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const { centerId } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const centerRes = await fetch(
        `${API_BASE}/api/admin/service-centers/${centerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (centerRes.status === 401) throw new Error("Unauthorized");
      if (!centerRes.ok) throw new Error(`Lỗi tải thông tin trung tâm`);
      const centerData = await centerRes.json();
      setCenterInfo(centerData);

      const partsRes = await fetch(
        `${API_BASE}/api/admin/service-centers/${centerId}/parts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (partsRes.status === 401) throw new Error("Unauthorized");
      if (!partsRes.ok) throw new Error(`Lỗi tải danh sách phụ tùng`);
      const partsData = await partsRes.json();
      setParts(Array.isArray(partsData) ? partsData : []);

      const partTypeRes = await fetch(`${API_BASE}/api/admin/part-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (partTypeRes.status === 401) throw new Error("Unauthorized");
      if (!partTypeRes.ok)
        throw new Error(`Lỗi tải danh sách loại phụ tùng`);
      const partTypeData = await partTypeRes.json();
      setPartTypes(Array.isArray(partTypeData) ? partTypeData : []);
    } catch (err) {
      console.error(err);
      if (err.message === "Unauthorized") {
        localStorage.clear();
        navigate("/");
      } else {
        setError("Không thể tải dữ liệu.");
      }
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
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const openForm = (part = null) => {
    setEditingPart(part);
    setShowForm(true);
    setError(null);
    if (part) {
      setFormData({
        name: part.name,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        laborCost: part.laborCost,
        materialCost: part.materialCost,
        partTypeId: part.partType?.id || "",
      });
    } else {
      setFormData({
        name: "",
        quantity: 0,
        unitPrice: 0,
        laborCost: 0,
        materialCost: 0,
        partTypeId: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partTypeId) {
      setError("Vui lòng chọn loại phụ tùng.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const method = editingPart ? "PUT" : "POST";
      const endpoint = editingPart
        ? `${API_BASE}/api/admin/parts/${editingPart.id}`
        : `${API_BASE}/api/admin/service-centers/${centerId}/parts`;

      const body = {
        name: formData.name,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        laborCost: parseFloat(formData.laborCost) || 0,
        materialCost: parseFloat(formData.materialCost) || 0,
        partTypeId: parseInt(formData.partTypeId),
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể lưu thông tin phụ tùng.");
      }

      await fetchData();
      setShowForm(false);
      setEditingPart(null);
    } catch (err) {
      console.error(err);
      if (err.message === "Unauthorized") {
        localStorage.clear();
        navigate("/");
      } else {
        setError(err.message);
      }
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

        <div className="actions-bar">
          <button
            className="btn-add"
            style={{ backgroundColor: "#6b7280" }}
            onClick={() => navigate("/admin/service-centers")}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <button className="btn-add" onClick={() => openForm()}>
            <FaPlus /> Thêm phụ tùng
          </button>
        </div>

        {error && !showForm && (
          <div
            className="error-message general-error"
            style={{ marginTop: "0", marginBottom: "20px" }}
          >
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Phụ tùng</th>
                  <th>Loại phụ tùng</th>
                  <th>Số lượng</th>
                  <th>Đơn giá (VND)</th>
                  <th>Phí nhân công (VND)</th>
                  <th>Phí vật tư (VND)</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {parts.length > 0 ? (
                  parts.map((part) => (
                    <tr key={part.id}>
                      <td>#{part.id}</td>
                      <td>{part.name}</td>
                      <td>{part.partType?.name || "N/A"}</td>
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
                    <td colSpan="8" className="empty-state">
                      Trung tâm này chưa có phụ tùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingPart ? "Chỉnh sửa phụ tùng" : "Thêm phụ tùng mới"}
              </h2>
              <form onSubmit={handleSubmit} className="user-form">
                {error && (
                  <div className="error-message">
                    <FaExclamationTriangle /> {error}
                  </div>
                )}

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
                  Loại Phụ tùng:
                  <select
                    name="partTypeId"
                    value={formData.partTypeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn loại phụ tùng --</option>
                    {partTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Số lượng:
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </label>

                <label>
                  Đơn giá (VND):
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </label>

                <label>
                  Phí nhân công (VND):
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </label>

                <label>
                  Phí vật tư (VND):
                  <small>
                    Phí này là chi phí chung, không bao gồm "Đơn giá" ở trên
                  </small>
                  <input
                    type="number"
                    name="materialCost"
                    value={formData.materialCost}
                    onChange={handleChange}
                    required
                    min="0"
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
