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
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    openingHour: "07:00",
    closingHour: "20:00"
  });
  const [formErrors, setFormErrors] = useState({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [centerToDeleteId, setCenterToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [userInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchCenters = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
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
        openingHour: center.openingHour || "",
        closingHour: center.closingHour || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        openingHour: "",
        closingHour: ""
      });
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
    if (formData.openingHour && formData.closingHour &&
      formData.openingHour >= formData.closingHour) {
      errors.closingHour = "Giờ đóng cửa phải sau giờ mở cửa.";
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
      const method = formData.id ? "PUT" : "POST";
      const endpoint = formData.id
        ? `${API_BASE_URL}/api/admin/service-centers/${formData.id}`
        : `${API_BASE_URL}/api/admin/service-centers`;

        console.log("=== SUBMIT DEBUG ===");
      console.log("Method:", method);
      console.log("Endpoint:", endpoint);
      console.log("FormData.id:", formData.id);
      console.log("EditingCenter:", editingCenter);
      console.log("Token exists:", !!token);
      console.log("Token value:", token?.substring(0, 20) + "...");
      const body = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        openingHour: formData.openingHour.trim(),
        closingHour: formData.closingHour.trim(),
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
        let errorMsg = "Có lỗi xảy ra.";
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
      const res = await fetch(`${API_BASE_URL}/api/admin/service-centers/${centerToDeleteId}`, {
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
            <Loading inline />
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
          <p>Thêm, chỉnh sửa thông tin các trung tâm bảo duỡng.</p>
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
            <FaPlus /> Thêm trung tâm
          </Button>
        </div>

        <div className="scm-table-card">
          {(actionLoading || isDeleting) && (
            <div className="scm-table-loading">
              <Loading inline /> Đang xử lý...
            </div>
          )}
          <table className="scm-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Trung tâm</th>
                <th>Địa chỉ</th>
                <th>SĐT</th>
                <th>Giờ mở cửa</th>
                <th>Giờ đóng cửa</th>
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
                    <td>{center.openingHour ? center.openingHour.substring(0, 5) : "N/A"}</td>
                    <td>{center.closingHour ? center.closingHour.substring(0, 5) : "N/A"}</td>
                    <td className="scm-action-buttons">
                      <Button
                        className="scm-btn-action scm-btn-view"
                        onClick={() => handleViewParts(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEye /> Phụ tùng
                      </Button>
                      <Button
                        className="scm-btn-action scm-btn-edit"
                        onClick={() => openForm(center)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaEdit /> Sửa
                      </Button>
                      <Button
                        className="scm-btn-action scm-btn-delete"
                        onClick={() => handleDeleteClick(center.id)}
                        disabled={actionLoading || isDeleting}
                      >
                        <FaTrash /> Xóa
                      </Button>
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
              <div className="scm-modal-header">
                <h2>{editingCenter ? "Chỉnh sửa Trung tâm Dịch vụ" : "Thêm Trung tâm Mới"}</h2>
                <button type="button" className="scm-btn-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>

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
                <div className="scm-form-group">
                  <label htmlFor="openingHour">Giờ mở cửa:</label>
                  <input
                    type="time"
                    id="openingHour"
                    name="openingHour"
                    value={formData.openingHour}
                    onChange={handleChange}
                    className={formErrors.openingHour ? "scm-input-error" : ""}
                  />
                  {formErrors.openingHour && (
                    <span className="scm-error-text">{formErrors.openingHour}</span>
                  )}
                </div>

                <div className="scm-form-group">
                  <label htmlFor="closingHour">Giờ đóng cửa:</label>
                  <input
                    type="time"
                    id="closingHour"
                    name="closingHour"
                    value={formData.closingHour}
                    onChange={handleChange}
                    className={formErrors.closingHour ? "scm-input-error" : ""}
                  />
                  {formErrors.closingHour && (
                    <span className="scm-error-text">{formErrors.closingHour}</span>
                  )}
                </div>

                <div className="scm-form-actions">
                  <Button type="submit" className="scm-btn-save" disabled={actionLoading}>
                    {actionLoading ? (
                      <Loading inline />
                    ) : (
                      <FaSave />
                    )}{" "}
                    {actionLoading ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button
                    type="button"
                    className="scm-btn-cancel"
                    onClick={() => setShowForm(false)}
                    disabled={actionLoading}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationModal
          visible={showConfirmModal}
          message={`Bạn chắc chắn muốn xóa Trung tâm ID: ${centerToDeleteId}?`}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          loading={isDeleting}
        />
      </main>
    </div>
  );
}
