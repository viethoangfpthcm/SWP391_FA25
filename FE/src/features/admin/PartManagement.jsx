import React, { useState, useEffect } from "react";
import {
  FaWrench,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
  FaTrash,
} from "react-icons/fa";
import "./PartManagement.css"; // ✅ ĐÃ CHỈNH: dùng file CSS riêng cho Part Management
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "@components/ui/ConfirmationModal.jsx";import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';



// --- Helper Functions ---
const isValidPartName = (name) => {
    // Basic check: not empty, at least 2 chars. Allows most characters.
    return name && name.trim().length >= 2;
};
const isPositiveNumberOrZero = (value) => {
    // Checks if the value is a number >= 0. Handles empty string and actual numbers.
    if (value === '' || value === null || value === undefined) return false; // Must provide a value
    const num = Number(value); // Use Number() for better parsing than parseFloat
    return !isNaN(num) && num >= 0;
};
// --- End Helpers ---

if (import.meta.env.MODE !== "development") {
}

export default function PartManagement() {
  const [parts, setParts] = useState([]);
  const [centerInfo, setCenterInfo] = useState(null);
  const [partTypes, setPartTypes] = useState([]); // For dropdown
  const [loading, setLoading] = useState(true); // Initial data load
  const [error, setError] = useState(null); // General errors
  const [actionLoading, setActionLoading] = useState(false); // For SAVE action
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  const [formData, setFormData] = useState({
    name: "", quantity: '', unitPrice: '', laborCost: '', materialCost: '', partTypeId: "", // Use '' for inputs initially
  });
  const [formErrors, setFormErrors] = useState({}); // Form validation errors

  // --- States for Delete Confirmation ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [partToDeleteId, setPartToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Specific loading for delete

  const [userInfo] = useState({
    fullName: localStorage.getItem("fullName") || "Admin",
    role: localStorage.getItem("role") || "ADMIN",
  });

  const { centerId } = useParams(); // Get centerId from URL
  const navigate = useNavigate();
  const API_BASE = "";
  const token = localStorage.getItem("token");

  // Fetch center info, parts for this center, and all part types
  const fetchData = async () => {
    // ... (Keep existing fetchData function - it seems okay) ...
     try {
      setError(null);
      setLoading(true);

      // Fetch Center Info
      const centerRes = await fetch(`${API_BASE}/api/admin/service-centers/${centerId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (centerRes.status === 401) throw new Error("Unauthorized");
      if (!centerRes.ok) throw new Error(`Lỗi tải thông tin trung tâm`);
      const centerData = await centerRes.json();
      setCenterInfo(centerData);

      // Fetch Parts for this Center
      const partsRes = await fetch(`${API_BASE}/api/admin/service-centers/${centerId}/parts`, { headers: { Authorization: `Bearer ${token}` } });
      if (partsRes.status === 401) throw new Error("Unauthorized");
      if (!partsRes.ok) throw new Error(`Lỗi tải danh sách phụ tùng`);
      const partsData = await partsRes.json();
      setParts(Array.isArray(partsData) ? partsData : []);

      // Fetch All Part Types (for dropdown)
      const partTypeRes = await fetch(`${API_BASE}/api/admin/part-types`, { headers: { Authorization: `Bearer ${token}` } });
      if (partTypeRes.status === 401) throw new Error("Unauthorized");
      if (!partTypeRes.ok) throw new Error(`Lỗi tải danh sách loại phụ tùng`);
      const partTypeData = await partTypeRes.json();
      setPartTypes(Array.isArray(partTypeData) ? partTypeData : []);

    } catch (err) {
      console.error("Fetch Data Error:", err);
      if (err.message === "Unauthorized") { localStorage.clear(); navigate("/"); }
      else { setError("Không thể tải dữ liệu. Vui lòng thử lại."); }
    } finally {
      setLoading(false);
    }
  };

   // --- DELETE ACTIONS ---
   const handleDeleteClick = (partId) => {
    setPartToDeleteId(partId);
    setShowConfirmModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!partToDeleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/parts/${partToDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.clear(); navigate("/"); return; }
      if (!res.ok) {
        let errorMsg = "Không thể xóa phụ tùng.";
         try { const errorData = await res.json(); errorMsg = errorData.message || `Lỗi ${res.status}`; } catch(e){}
         throw new Error(errorMsg);
      }
      // Success
      setShowConfirmModal(false);
      setPartToDeleteId(null);
      await fetchData(); // Refresh list
      // Optional: Success toast: toast.success('Xóa phụ tùng thành công!');
    } catch (err) {
      console.error("Delete Part Error:", err);
      setError(err.message || "Xóa phụ tùng thất bại.");
      // Keep modal open on error?
      // setShowConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setPartToDeleteId(null);
    setError(null);
  };
  // --- END DELETE ACTIONS ---

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchData();
  }, [token, centerId, navigate]); // Added navigate

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for the field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    if (error) setError(null); // Clear general error
  };

  // Open add/edit form
  const openForm = (part = null) => {
    setEditingPart(part);
    setFormErrors({});
    setError(null);
    setShowForm(true);
    if (part) { // Editing
      setFormData({
        name: part.name || "",
        // Ensure values are strings for input fields, handle null/undefined
        quantity: part.quantity?.toString() ?? '',
        unitPrice: part.unitPrice?.toString() ?? '',
        laborCost: part.laborCost?.toString() ?? '',
        materialCost: part.materialCost?.toString() ?? '',
        partTypeId: part.partType?.id || "",
      });
    } else { // Adding
      setFormData({ name: "", quantity: '', unitPrice: '', laborCost: '', materialCost: '', partTypeId: "" });
    }
  };

   // Validate form before submit
  const validateForm = () => {
    const errors = {};
    if (!isValidPartName(formData.name)) {
        errors.name = "Tên phụ tùng không hợp lệ (ít nhất 2 ký tự).";
    }
    if (!formData.partTypeId) {
        errors.partTypeId = "Vui lòng chọn loại phụ tùng.";
    }
    // Check if numbers are valid and non-negative
    if (!isPositiveNumberOrZero(formData.quantity)) {
        errors.quantity = "Số lượng không hợp lệ (phải là số >= 0).";
    }
    if (!isPositiveNumberOrZero(formData.unitPrice)) {
        errors.unitPrice = "Đơn giá không hợp lệ (phải là số >= 0).";
    }
     if (!isPositiveNumberOrZero(formData.laborCost)) {
        errors.laborCost = "Phí nhân công không hợp lệ (phải là số >= 0).";
    }
     if (!isPositiveNumberOrZero(formData.materialCost)) {
        errors.materialCost = "Phí vật tư không hợp lệ (phải là số >= 0).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (Create or Update Part)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return; // Stop if frontend validation fails
    }

    setActionLoading(true);

    try {
      const method = editingPart ? "PUT" : "POST";
      const endpoint = editingPart
        ? `${API_BASE}/api/admin/parts/${editingPart.id}`
        : `${API_BASE}/api/admin/service-centers/${centerId}/parts`;

      // Prepare body, ensuring numbers are correctly parsed from validated strings
      const body = {
        name: formData.name.trim(),
        // Convert valid string numbers back to numbers for API
        quantity: parseInt(formData.quantity) || 0, // Default to 0 if parsing fails (shouldn't happen due to validation)
        unitPrice: parseFloat(formData.unitPrice) || 0,
        laborCost: parseFloat(formData.laborCost) || 0,
        materialCost: parseFloat(formData.materialCost) || 0,
        partTypeId: parseInt(formData.partTypeId),
      };
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.status === 401) throw new Error("Unauthorized");

      if (!res.ok) {
        let errorMsg = "Đã có lỗi xảy ra.";
        let fieldErrors = {};
         try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
           if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
             fieldErrors = errorData.fieldErrors;
             setFormErrors(prev => ({ ...prev, ...fieldErrors }));
             errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          }
        } catch (parseError) { errorMsg = `Lỗi ${res.status}. Không thể đọc chi tiết.`; }
        throw new Error(errorMsg);
      }

      // Success
      await fetchData(); // Refresh data
      setShowForm(false);
      setEditingPart(null);
      // Optional: Success toast: toast.success('Lưu phụ tùng thành công!');

    } catch (err) {
      console.error("Submit Part Error:", err);
       if (err.message === "Unauthorized") { localStorage.clear(); navigate("/"); }
       else { setError(err.message || "Không thể lưu thông tin phụ tùng."); }
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
 if (loading) { // Chỉ cần kiểm tra biến loading
    return (
      <div className="dashboard-container">
        {/* Giữ nguyên Sidebar và nội dung loading */}
        <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
        <main className="main-content loading-state">
          <Loading inline />
          <p>Đang tải dữ liệu...</p> {/* Có thể đổi text nếu muốn */}
        </main>
      </div>
    );
  }

  // Main Render
  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo.fullName} userRole={userInfo.role} />
      <main className="main-content">
        <header className="page-header">
          <h1><FaWrench /> Quản lý Phụ tùng</h1>
          <p>Danh sách phụ tùng tại: <strong>{centerInfo?.name || `Trung tâm ID #${centerId}`}</strong></p>
        </header>

        {/* Action Bar: Back and Add buttons */}
        <div className="actions-bar">
          <Button className="btn-back" onClick={() => navigate("/admin/service-centers")} disabled={actionLoading || isDeleting}>
            <FaArrowLeft /> Quay lại QL Trung tâm
          </Button>
          <Button className="btn-add" onClick={() => openForm()} disabled={actionLoading || isDeleting}>
            <FaPlus /> Thêm phụ tùng
          </Button>
        </div>

        {/* General Error Display (outside modals) */}
        {error && !showForm && !showConfirmModal && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Parts List Table */}
        <div className="table-card">
          {(loading && parts.length > 0) && <div className="table-loading-overlay"><Loading inline /> Đang tải lại...</div>}
          <div className="table-wrapper">
            <table className="data-table parts-table">
              <thead>
                <tr>
                  <th>ID</th><th>Tên Phụ tùng</th><th>Loại</th>
                  <th className="numeric-cell">Số lượng</th>
                  <th className="numeric-cell">Đơn giá</th>
                  <th className="numeric-cell">Phí Nhân Công</th>
                  <th className="numeric-cell">Phí Vật Tư</th>
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
                      <td className="numeric-cell">{part.quantity}</td>
                      {/* Format numbers for display */}
                      <td className="numeric-cell">{part.unitPrice != null ? part.unitPrice.toLocaleString('vi-VN') : 'N/A'}</td>
                      <td className="numeric-cell">{part.laborCost != null ? part.laborCost.toLocaleString('vi-VN') : 'N/A'}</td>
                      <td className="numeric-cell">{part.materialCost != null ? part.materialCost.toLocaleString('vi-VN') : 'N/A'}</td>
                      <td className="action-buttons-cell">
                        <Button className="btn-action btn-edit" onClick={() => openForm(part)} disabled={actionLoading || isDeleting}>
                          <FaEdit /> Sửa
                        </Button>
                         <Button className="btn-action btn-delete" onClick={() => handleDeleteClick(part.id)} disabled={actionLoading || isDeleting}>
                          <FaTrash /> Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="empty-state-row">{loading ? "Đang tải..." : "Trung tâm này chưa có phụ tùng nào."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Part Modal Form */}
        {showForm && (
          <div className="modal-overlay" onClick={() => !actionLoading && setShowForm(false)}>
            <div className="modal part-edit-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingPart ? "Chỉnh sửa phụ tùng" : "Thêm phụ tùng mới"}</h2>

              {/* Display Submit Errors INSIDE Modal */}
              {error && (
                <div className="error-message form-error">
                  <FaExclamationTriangle /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="user-form part-form" noValidate>
                 {/* Name */}
                 <div className="form-group">
                   <label htmlFor="name">Tên Phụ tùng:</label>
                   <input
                     type="text" id="name" name="name"
                     value={formData.name} onChange={handleChange}
                     className={formErrors.name ? 'input-error' : ''}
                     aria-describedby="nameError" aria-invalid={!!formErrors.name}
                   />
                   {formErrors.name && <span id="nameError" className="error-text">{formErrors.name}</span>}
                 </div>

                {/* Part Type */}
                <div className="form-group">
                   <label htmlFor="partTypeId">Loại Phụ tùng:</label>
                   <select
                     id="partTypeId" name="partTypeId"
                     value={formData.partTypeId} onChange={handleChange}
                     className={formErrors.partTypeId ? 'input-error' : ''}
                     aria-describedby="partTypeIdError" aria-invalid={!!formErrors.partTypeId}
                     disabled={!!editingPart}
                   >
                     <option value="">-- Chọn loại --</option>
                     {partTypes.map((type) => (
                       <option key={type.id} value={type.id}>{type.name}</option>
                     ))}
                   </select>
                   {formErrors.partTypeId && <span id="partTypeIdError" className="error-text">{formErrors.partTypeId}</span>}
                 </div>

                 {/* Quantity */}
                 <div className="form-group">
                   <label htmlFor="quantity">Số lượng:</label>
                   <input
                     type="number" id="quantity" name="quantity"
                     value={formData.quantity} onChange={handleChange}
                     min="0" step="1" // Allow integers >= 0
                     className={formErrors.quantity ? 'input-error' : ''}
                     aria-describedby="quantityError" aria-invalid={!!formErrors.quantity}
                   />
                   {formErrors.quantity && <span id="quantityError" className="error-text">{formErrors.quantity}</span>}
                 </div>

                 {/* Unit Price */}
                 <div className="form-group">
                   <label htmlFor="unitPrice">Đơn giá (VND):</label>
                   <input
                     type="number" id="unitPrice" name="unitPrice"
                     value={formData.unitPrice} onChange={handleChange}
                     min="0" step="any" // Allow decimals >= 0
                     className={formErrors.unitPrice ? 'input-error' : ''}
                     aria-describedby="unitPriceError" aria-invalid={!!formErrors.unitPrice}
                   />
                    {formErrors.unitPrice && <span id="unitPriceError" className="error-text">{formErrors.unitPrice}</span>}
                 </div>

                 {/* Labor Cost */}
                 <div className="form-group">
                   <label htmlFor="laborCost">Phí nhân công (VND):</label>
                   <input
                     type="number" id="laborCost" name="laborCost"
                     value={formData.laborCost} onChange={handleChange}
                     min="0" step="any"
                     className={formErrors.laborCost ? 'input-error' : ''}
                     aria-describedby="laborCostError" aria-invalid={!!formErrors.laborCost}
                   />
                   {formErrors.laborCost && <span id="laborCostError" className="error-text">{formErrors.laborCost}</span>}
                 </div>

                 {/* Material Cost */}
                 <div className="form-group">
                   <label htmlFor="materialCost">Phí vật tư (VND):</label>
                   {/* <small className="field-hint">Phí này là chi phí chung...</small> */} {/* Optional hint */}
                   <input
                     type="number" id="materialCost" name="materialCost"
                     value={formData.materialCost} onChange={handleChange}
                     min="0" step="any"
                     className={formErrors.materialCost ? 'input-error' : ''}
                     aria-describedby="materialCostError" aria-invalid={!!formErrors.materialCost}
                   />
                   {formErrors.materialCost && <span id="materialCostError" className="error-text">{formErrors.materialCost}</span>}
                 </div>

                 {/* Form Actions */}
                <div className="form-actions">
                  <Button type="submit" className="btn-save" disabled={actionLoading}>
                    {actionLoading ? <Loading inline /> : <FaSave />}{" "}
                    {actionLoading ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={actionLoading}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Confirmation Modal for Deletion --- */}
        <ConfirmationModal
          show={showConfirmModal}
          message={`Bạn chắc chắn muốn xóa Phụ tùng ID: ${partToDeleteId}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting}
        />

      </main>
    </div>
  );
}