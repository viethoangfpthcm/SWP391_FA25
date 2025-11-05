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
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "@components/ui/ConfirmationModal.jsx";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import { API_BASE_URL } from "@config/api.js";


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
  const API_BASE = API_BASE_URL;
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
      if (!res.ok) throw new Error(`L?i t?i danh s�ch trung t�m (${res.status})`);
      const data = await res.json();
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Centers Error:", err);
      setError("Kh�ng th? t?i danh s�ch trung t�m.");
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
        "T�n trung t�m kh�ng h?p l? (�t nh?t 2 k� t?, kh�ng ch?a k� t? d?c bi?t).";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "�?a ch? kh�ng du?c d? tr?ng.";
    }
    if (!formData.phone || !isValidPhone(formData.phone)) {
      errors.phone = "S? di?n tho?i kh�ng d�ng d?nh d?ng VN (10 s?).";
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
        let errorMsg = "�� c� l?i x?y ra.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `L?i ${res.status}`;
        } catch {
          errorMsg = `L?i ${res.status}`;
        }
        throw new Error(errorMsg);
      }

      await fetchCenters();
      setShowForm(false);
      setEditingCenter(null);
    } catch (err) {
      console.error("Submit Center Error:", err);
      setError(err.message || "Kh�ng th? luu th�ng tin trung t�m.");
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
        throw new Error("Kh�ng th? x�a trung t�m.");
      }
      setShowConfirmModal(false);
      setCenterToDeleteId(null);
      await fetchCenters();
    } catch (err) {
      console.error("Delete Center Error:", err);
      setError(err.message || "X�a trung t�m th?t b?i.");
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
            <Loading inline />
            <p>�ang t?i d? li?u trung t�m...</p>
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
            <FaBuilding /> Qu?n l� Trung t�m D?ch v?
          </h1>
          <p>Th�m, ch?nh s?a th�ng tin c�c trung t�m b?o du?ng.</p>
        </header>

        {error && !showForm && !showConfirmModal && (
          <div className="scm-error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="scm-actions">
          <Button
            className="scm-btn-add"
            onClick={() => openForm()}
            disabled={actionLoading || isDeleting}
          >
            <FaPlus /> Th�m trung t�m
          </Button>
        </div>

        <div className="scm-table-card">
          {(actionLoading || isDeleting) && (
            <div className="scm-table-loading">
              <Loading inline /> �ang x? l�...
            </div>
          )}
          <table className="scm-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>T�n Trung t�m</th>
                <th>�?a ch?</th>
                <th>S�T</th>
                <th>Thao t�c</th>
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
                      <Button
                        className="scm-btn-action scm-btn-view"
                        onClick={() => handleViewParts(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEye /> Ph? t�ng
                      </Button>
                      <Button
                        className="scm-btn-action scm-btn-edit"
                        onClick={() => openForm(center)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEdit /> S?a
                      </Button>
                      <Button
                        className="scm-btn-action scm-btn-delete"
                        onClick={() => handleDeleteClick(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaTrash /> X�a
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#666" }}>
                    Chua c� trung t�m d?ch v? n�o.
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
              <h2>{editingCenter ? "Ch?nh s?a trung t�m" : "Th�m trung t�m m?i"}</h2>

              {error && (
                <div className="scm-error-message">
                  <FaExclamationTriangle /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="scm-user-form">
                <div className="scm-form-group">
                  <label htmlFor="name">T�n Trung t�m:</label>
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
                  <label htmlFor="address">�?a ch?:</label>
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
                  <label htmlFor="phone">S? di?n tho?i:</label>
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
                  <Button type="submit" className="scm-btn-save" disabled={actionLoading}>
                    {actionLoading ? (
                      <Loading inline />
                    ) : (
                      <FaSave />
                    )}{" "}
                    {actionLoading ? "�ang luu..." : "Luu"}
                  </Button>
                  <Button
                    type="button"
                    className="scm-btn-cancel"
                    onClick={() => setShowForm(false)}
                    disabled={actionLoading}
                  >
                    H?y
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationModal
          show={showConfirmModal}
          message={`B?n ch?c ch?n mu?n x�a Trung t�m ID: ${centerToDeleteId}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting}
        />
      </main>
    </div>
  );
}
