import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import "./ServiceCenterManagement.css";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";

// --- Helper Functions ---
const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex =
    /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
  return phoneRegex.test(phone.trim());
};

const isValidName = (name) => {
  if (!name || name.trim().length < 2) return false;
  const nameRegex = /^[\p{L}0-9\s]{2,}$/u;
  return nameRegex.test(name.trim());
};
// --- End Helpers ---

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
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });
  const [formErrors, setFormErrors] = useState({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [centerToDeleteId, setCenterToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [userInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

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
      if (!res.ok) throw new Error(`Lỗi tải danh sách trung tâm (${res.status})`);
      const data = await res.json();
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Centers Error:", err);
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
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (error) setError(null);
  };

  const openForm = (center = null) => {
    setEditingCenter(center);
    setFormErrors({});
    setError(null);
    setShowForm(true);
    if (center) {
      setFormData({
        id: center.id,
        name: center.name || "",
        address: center.address || "",
        phone: center.phone || "",
      });
    } else {
      setFormData({ name: "", address: "", phone: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || !isValidName(formData.name)) {
      errors.name =
        "Tên trung tâm không hợp lệ (ít nhất 2 ký tự, không chứa ký tự đặc biệt).";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "Địa chỉ không được để trống.";
    }
    if (!formData.phone || !isValidPhone(formData.phone)) {
      errors.phone = "Số điện thoại không đúng định dạng VN (10 số).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setActionLoading(true);

    try {
      const method = editingCenter ? "PUT" : "POST";
      const endpoint = editingCenter
        ? `${API_BASE}/api/admin/service-centers/${editingCenter.id}`
        : `${API_BASE}/api/admin/service-centers`;

      const body = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
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

      if (!res.ok) {
        let errorMsg = "Đã có lỗi xảy ra.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
        } catch {
          errorMsg = `Lỗi ${res.status}`;
        }
        throw new Error(errorMsg);
      }

      await fetchCenters();
      setShowForm(false);
      setEditingCenter(null);
    } catch (err) {
      console.error("Submit Center Error:", err);
      setError(err.message || "Không thể lưu thông tin trung tâm.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (centerId) => {
    setCenterToDeleteId(centerId);
    setShowConfirmModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!centerToDeleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/service-centers/${centerToDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }
      if (!res.ok) {
        throw new Error("Không thể xóa trung tâm.");
      }
      setShowConfirmModal(false);
      setCenterToDeleteId(null);
      await fetchCenters();
    } catch (err) {
      console.error("Delete Center Error:", err);
      setError(err.message || "Xóa trung tâm thất bại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setCenterToDeleteId(null);
    setError(null);
  };

  const handleViewParts = (centerId) => {
    navigate(`/admin/parts/${centerId}`);
  };

  if (loading) {
    return (
      <div className="scm-container">
        <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
        <main className="scm-content">
          <div className="scm-loading">
            <FaSpinner className="scm-spinner" />
            <p>Đang tải dữ liệu trung tâm...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="scm-container">
      <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
      <main className="scm-content">
        <header className="scm-header">
          <h1>
            <FaBuilding /> Quản lý Trung tâm Dịch vụ
          </h1>
          <p>Thêm, chỉnh sửa thông tin các trung tâm bảo dưỡng.</p>
        </header>

        {error && !showForm && !showConfirmModal && (
          <div className="scm-error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="scm-actions">
          <button
            className="scm-btn-add"
            onClick={() => openForm()}
            disabled={actionLoading || isDeleting}
          >
            <FaPlus /> Thêm trung tâm
          </button>
        </div>

        <div className="scm-table-card">
          {(actionLoading || isDeleting) && (
            <div className="scm-table-loading">
              <FaSpinner className="scm-spinner" /> Đang xử lý...
            </div>
          )}
          <table className="scm-data-table">
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
                    <td className="scm-action-buttons">
                      <button
                        className="scm-btn-action scm-btn-view"
                        onClick={() => handleViewParts(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEye /> Phụ tùng
                      </button>
                      <button
                        className="scm-btn-action scm-btn-edit"
                        onClick={() => openForm(center)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        className="scm-btn-action scm-btn-delete"
                        onClick={() => handleDeleteClick(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#666" }}>
                    Chưa có trung tâm dịch vụ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div
            className="scm-modal-overlay"
            onClick={() => !actionLoading && setShowForm(false)}
          >
            <div className="scm-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCenter ? "Chỉnh sửa trung tâm" : "Thêm trung tâm mới"}</h2>

              {error && (
                <div className="scm-error-message">
                  <FaExclamationTriangle /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="scm-user-form">
                <div className="scm-form-group">
                  <label htmlFor="name">Tên Trung tâm:</label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={formErrors.name ? "scm-input-error" : ""}
                  />
                  {formErrors.name && (
                    <span className="scm-error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="scm-form-group">
                  <label htmlFor="address">Địa chỉ:</label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={formErrors.address ? "scm-input-error" : ""}
                  />
                  {formErrors.address && (
                    <span className="scm-error-text">{formErrors.address}</span>
                  )}
                </div>

                <div className="scm-form-group">
                  <label htmlFor="phone">Số điện thoại:</label>
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={formErrors.phone ? "scm-input-error" : ""}
                  />
                  {formErrors.phone && (
                    <span className="scm-error-text">{formErrors.phone}</span>
                  )}
                </div>

                <div className="scm-form-actions">
                  <button type="submit" className="scm-btn-save" disabled={actionLoading}>
                    {actionLoading ? (
                      <FaSpinner className="scm-spinner" />
                    ) : (
                      <FaSave />
                    )}{" "}
                    {actionLoading ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    type="button"
                    className="scm-btn-cancel"
                    onClick={() => setShowForm(false)}
                    disabled={actionLoading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationModal
          show={showConfirmModal}
          message={`Bạn chắc chắn muốn xóa Trung tâm ID: ${centerToDeleteId}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting}
        />
      </main>
    </div>
  );
}
