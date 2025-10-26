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
import "../admin/AdminDashboard.css"; 
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from '../../components/ConfirmationModal.jsx'; 

// --- Helper Functions ---
const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
  return phoneRegex.test(phone.trim()); // Trim before testing
};
const isValidName = (name) => {
    // Allows letters (including Vietnamese), numbers, and spaces. Min 2 chars.
    if (!name || name.trim().length < 2) return false;
    const nameRegex = /^[\p{L}0-9\s]{2,}$/u; // Added u flag for Unicode
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

  // --- States for Delete Confirmation ---
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
      if (res.status === 401) { localStorage.clear(); navigate("/"); return; }
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
    if (!token) { navigate("/"); return; }
    fetchCenters();
  }, [token, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
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
    } else { // Adding
      setFormData({ name: "", address: "", phone: "" });
    }
  };

   // Validate the form before submitting
   const validateForm = () => {
    const errors = {};
    if (!formData.name || !isValidName(formData.name)) { // Use helper
      errors.name = "Tên trung tâm không hợp lệ (ít nhất 2 ký tự, không chứa ký tự đặc biệt).";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "Địa chỉ không được để trống.";
    }
    if (!formData.phone || !isValidPhone(formData.phone)) { // Use helper
      errors.phone = "Số điện thoại không đúng định dạng VN (10 số).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!validateForm()) {
        return; // Stop if validation fails
    }

    setActionLoading(true);

    try {
      const method = editingCenter ? "PUT" : "POST";
      const endpoint = editingCenter
        ? `${API_BASE}/api/admin/service-centers/${editingCenter.id}`
        : `${API_BASE}/api/admin/service-centers`;

       // Send trimmed data
      const body = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
      };
      // For PUT, include the id if needed by backend (depends on backend logic)
      // if (editingCenter) body.id = editingCenter.id;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) { localStorage.clear(); navigate("/"); return; }

      // Handle backend errors (including validation)
      if (!res.ok) {
        let errorMsg = "Đã có lỗi xảy ra.";
        let fieldErrors = {};
         try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
          // Check for backend field-specific errors (if backend provides them)
          if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
             fieldErrors = errorData.fieldErrors;
             setFormErrors(prev => ({ ...prev, ...fieldErrors }));
             errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          }
        } catch (parseError) { errorMsg = `Lỗi ${res.status}. Không thể đọc chi tiết.`; }
        throw new Error(errorMsg);
      }

      // Success
      await fetchCenters(); // Refresh list
      setShowForm(false);   // Close modal
      setEditingCenter(null);
      // Optional: Show success toast: toast.success('Lưu trung tâm thành công!');

    } catch (err) {
      console.error("Submit Center Error:", err);
      setError(err.message || "Không thể lưu thông tin trung tâm.");
    } finally {
      setActionLoading(false);
    }
  };

   // --- DELETE ACTIONS ---
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
      if (res.status === 401) { localStorage.clear(); navigate("/"); return; }
      if (!res.ok) {
        let errorMsg = "Không thể xóa trung tâm.";
         try {
            const errorData = await res.json();
            // Check for specific backend messages (e.g., cannot delete if related data exists)
            errorMsg = errorData.message || `Lỗi ${res.status}`;
         } catch(e){}
         throw new Error(errorMsg);
      }
      // Success
      setShowConfirmModal(false);
      setCenterToDeleteId(null);
      await fetchCenters(); // Refresh
      // Optional: Success toast: toast.success('Xóa trung tâm thành công!');
    } catch (err) {
      console.error("Delete Center Error:", err);
      setError(err.message || "Xóa trung tâm thất bại.");
      // Keep modal open on error?
      // setShowConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setCenterToDeleteId(null);
    setError(null); // Clear error if shown in modal context
  };
  // --- END DELETE ACTIONS ---

  // Navigate to part management page
  const handleViewParts = (centerId) => {
    navigate(`/admin/parts/${centerId}`); // Make sure this route exists
  };

  // Loading state
  if (loading) { // Chỉ kiểm tra loading
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

  // Main Render
  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
      <main className="main-content">

        {/* Luôn hiển thị Header nếu không loading */}
        <header className="page-header">
           <h1><FaBuilding /> Quản lý Trung tâm Dịch vụ</h1>
           <p>Thêm, chỉnh sửa thông tin các trung tâm bảo dưỡng.</p>
        </header>

        {/* Hiển thị lỗi chung nếu có (khi modal đóng) */}
        {error && !showForm && !showConfirmModal && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Hiển thị nội dung chính (nếu không có lỗi) */}
        {!error && (
          <>
            {/* Add Button Bar */}
            <div className="actions-bar">
              <div /> {/* Placeholder */}
              <button className="btn-add" onClick={() => openForm()} disabled={actionLoading || isDeleting}>
                <FaPlus /> Thêm trung tâm
              </button>
            </div>

            {/* Centers List Table */}
            <div className="table-card">
              {(actionLoading || isDeleting) && <div className="table-loading-overlay"><FaSpinner className="spinner"/> Đang xử lý...</div>}
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Tên Trung tâm</th><th>Địa chỉ</th>
                      <th>SĐT</th><th>Thao tác</th>
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
                              className="btn-action btn-view-parts"
                              onClick={() => handleViewParts(center.id)}
                              disabled={actionLoading || isDeleting}
                              title="Xem phụ tùng của trung tâm này"
                            >
                              <FaEye /> Phụ tùng
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => openForm(center)}
                              disabled={actionLoading || isDeleting}
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteClick(center.id)}
                              disabled={actionLoading || isDeleting}
                            >
                              <FaTrash /> Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="empty-state-row">Chưa có trung tâm dịch vụ nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {showForm && (
           <div className="modal-overlay" onClick={() => !actionLoading && setShowForm(false)}>
            <div className="modal center-edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCenter ? "Chỉnh sửa trung tâm" : "Thêm trung tâm mới"}</h2>
              {error && (
                 <div className="error-message form-error">
                   <FaExclamationTriangle /> {error}
                 </div>
               )}

              <form onSubmit={handleSubmit} className="user-form" noValidate>
                 <div className="form-group"> {/* Name */}
                   <label htmlFor="name">Tên Trung tâm:</label>
                   <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={formErrors.name ? 'input-error' : ''} aria-describedby="nameError" aria-invalid={!!formErrors.name}/>
                   {formErrors.name && <span id="nameError" className="error-text">{formErrors.name}</span>}
                 </div>
                 <div className="form-group"> {/* Address */}
                    <label htmlFor="address">Địa chỉ:</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={formErrors.address ? 'input-error' : ''} aria-describedby="addressError" aria-invalid={!!formErrors.address}/>
                    {formErrors.address && <span id="addressError" className="error-text">{formErrors.address}</span>}
                 </div>
                 <div className="form-group"> {/* Phone */}
                   <label htmlFor="phone">Số điện thoại:</label>
                   <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={formErrors.phone ? 'input-error' : ''} aria-describedby="phoneError" aria-invalid={!!formErrors.phone}/>
                   {formErrors.phone && <span id="phoneError" className="error-text">{formErrors.phone}</span>}
                 </div>
                 <div className="form-actions"> {/* Buttons */}
                    <button type="submit" className="btn-save" disabled={actionLoading}>
                      {actionLoading ? <FaSpinner className="spinner-icon spin-inline" /> : <FaSave />}{" "}
                      {actionLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={actionLoading}>
                      Hủy
                    </button>
                 </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmationModal
          show={showConfirmModal}
          message={`Bạn chắc chắn muốn xóa Trung tâm ID: ${centerToDeleteId}? Việc này có thể ảnh hưởng đến dữ liệu liên quan.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting}
        />

      </main>
    </div>
  );
}
