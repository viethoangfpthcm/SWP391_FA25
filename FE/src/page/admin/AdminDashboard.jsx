import React, { useState, useEffect, useMemo } from "react";
import {
  FaUserCog,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaExclamationTriangle,
  FaSave,
  FaTimes, // Import FaTimes for cancel button
  FaCheck, // Import FaCheck for confirm button
} from "react-icons/fa";
import "./AdminDashboard.css";
import Sidebar from "../../page/sidebar/sidebar.jsx"; // Đảm bảo đường dẫn đúng
import { useNavigate } from "react-router-dom";
import ConfirmationModal from '../../components/ConfirmationModal.jsx';

// --- Helper Functions for Validation ---
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  // Vietnamese phone number regex (10 digits)
  const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
  return phoneRegex.test(phone);
};
// --- End Helper Functions ---

if (import.meta.env.MODE !== "development") {
  console.log = () => { };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [loading, setLoading] = useState(true); // Loading for initial user list
  const [error, setError] = useState(null); // General error (fetch, delete, submit API failure)
  const [actionLoading, setActionLoading] = useState(false); // Loading for SAVE action in form
  const [showForm, setShowForm] = useState(false);
  const getToken = () => localStorage.getItem("token");
  const [editingUser, setEditingUser] = useState(null); // Store user being edited
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    centerId: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({}); // State to hold form validation errors
  const [userInfo, setUserInfo] = useState(null); // Current admin user info
  const navigate = useNavigate();

  // --- States for Confirmation Modal ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state specifically for delete action
  const [isToggling, setIsToggling] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Fetch current admin user info
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
      const data = await res.json();
      localStorage.setItem("fullName", data.fullName || "Admin");
      localStorage.setItem("role", data.role || "ADMIN");
      setUserInfo({ fullName: data.fullName, role: data.role });
    } catch (err) {
      console.error("Fetch User Info Error:", err);
      // Displaying error might be annoying here if transient
    }
  };

  // Fetch list of users
  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }
      if (!res.ok) throw new Error(`Lỗi tải danh sách người dùng (${res.status})`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUserInfo();
    fetchUsers();
  }, [token, navigate]);

  const centerList = useMemo(() => {
    // Lấy tất cả 'centerName' có trong danh sách users
    const centers = users
      .map(user => user.centerName)
      .filter(Boolean); // Lọc bỏ các giá trị null/undefined/""

    // Dùng Set để lấy duy nhất và sort theo ABC
    return [...new Set(centers)].sort();
  }, [users]); // Chỉ chạy lại khi 'users' thay đổi

  // --- Logic Lọc Chuỗi (Role -> Center -> Active) ---
  const filteredUsers = users
    .filter(user => {
      // 1. Lọc theo Role
      if (filterRole === "all") return true;
      return user.role && user.role.toLowerCase() === filterRole.toLowerCase();
    })
    .filter(user => {
      // 2. Lọc theo Center
      if (filterCenter === "all") return true;
      if (filterCenter === "none") return !user.centerName;
      return user.centerName === filterCenter;
    })
    .filter(user => {
      // 3. Lọc theo Trạng thái Active
      if (filterActive === "all") return true;
      if (filterActive === "true") return !!user.isActive;
      if (filterActive === "false") return !user.isActive;
      return true;
    });


  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "role" && value === "CUSTOMER") {
        newData.centerId = ""; // Clear centerId if role is Customer
      }
      return newData;
    });
    // Clear validation error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Clear general submit error when user starts editing again
    if (error) setError(null);
  };

  // Open the modal form for adding or editing
  const openForm = (user = null) => {
    setEditingUser(user);
    setFormErrors({}); // Clear previous validation errors
    setError(null);     // Clear previous general submit error
    setShowForm(true);
    if (user) { // Populate form for editing
      setFormData({
        userId: user.userId,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        centerId: user.centerId || "",
        password: "", // Always clear password field for editing
      });
    } else { // Reset form for adding
      setFormData({
        fullName: "", email: "", phone: "", role: "", centerId: "", password: "",
      });
    }
  };

  // Validate the form data client-side
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim() === "") {
      errors.fullName = "Họ tên không được để trống.";
    }
    if (!formData.email || !isValidEmail(formData.email.trim())) {
      errors.email = "Email không đúng định dạng.";
    }
    if (!formData.phone || !isValidPhone(formData.phone.trim())) {
      errors.phone = "Số điện thoại không đúng định dạng VN (10 số).";
    }
    if (!formData.role) {
      errors.role = "Vui lòng chọn vai trò.";
    }
    // Password required only when adding a new user
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    // Center ID required (and must be positive number) for Staff/Technician
    const centerIdValue = formData.centerId ? String(formData.centerId).trim() : "";
    if ((formData.role === "STAFF" || formData.role === "TECHNICIAN") && (centerIdValue === "" || isNaN(parseInt(centerIdValue)) || parseInt(centerIdValue) <= 0)) {
      errors.centerId = "Center ID là bắt buộc (số dương) cho Staff/Technician.";
    }

    setFormErrors(errors); // Update the error state
    return Object.keys(errors).length === 0; // Return true if valid
  };

  // Handle form submission (Create or Update API call)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous general errors

    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    setActionLoading(true); // Show loading spinner on save button

    try {
      const method = editingUser ? "PUT" : "POST";
      const endpoint = editingUser
        ? `${API_BASE}/api/admin/users-update?userIdToUpdate=${editingUser.userId}`
        : `${API_BASE}/api/admin/users-create`;

      const requestBody = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        ...(editingUser ? {} : { password: formData.password }), // Only send password on create
        ...((formData.role !== "CUSTOMER" && formData.centerId) && {
          centerId: parseInt(formData.centerId) // Send centerId if applicable
        })
      };

      console.log("Submitting Request body:", requestBody);

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Handle response errors (including validation errors from backend)
      if (!res.ok) {
        let errorMsg = "Đã có lỗi xảy ra khi lưu.";
        let fieldErrors = {};
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
          // Check if backend returned field-specific errors
          if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
            fieldErrors = errorData.fieldErrors;
            setFormErrors(prev => ({ ...prev, ...fieldErrors })); // Set field errors state
            errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường."; // More generic message
          }
        } catch (parseError) {
          errorMsg = `Lỗi ${res.status}. Không thể đọc chi tiết lỗi.`;
        }
        throw new Error(errorMsg); // Throw error to be caught below
      }

      // --- Success ---
      await fetchUsers();   // Refresh the user list on success
      setShowForm(false);   // Close the modal
      setEditingUser(null); // Reset editing state
      // Consider adding a success toast here: toast.success('Lưu thành công!');

    } catch (err) {
      console.error("Submit error:", err);
      // Display general submit error inside the modal
      setError(err.message || "Không thể thực hiện yêu cầu.");
    } finally {
      setActionLoading(false); // Stop loading spinner on save button
    }
  };

  // --- DELETE ACTION: Opens Confirmation Modal ---
  const handleDeleteClick = (userId) => {
    setUserToDeleteId(userId); // Set the ID to be deleted
    setShowConfirmModal(true); // Show the confirmation modal
    setError(null);            // Clear any previous general error
  };

  // --- Actual DELETE API call (triggered by confirmation modal) ---
  const confirmDelete = async () => {
    if (!userToDeleteId) return;

    setIsDeleting(true); // Start delete loading indicator
    setError(null);      // Clear previous error

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }

      if (!res.ok) {
        let errorMsg = "Không thể xóa người dùng.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      // --- Success ---
      setShowConfirmModal(false); // Close confirmation modal
      setUserToDeleteId(null);
      await fetchUsers(); // Refresh user list
      // Consider adding a success toast here: toast.success('Xóa thành công!');

    } catch (err) {
      console.error("Delete Error:", err);
      // Display error (can be shown as general error or inside confirmation modal if kept open)
      setError(err.message || "Xóa người dùng thất bại.");
      // setShowConfirmModal(false); // Optionally close modal even on error
    } finally {
      setIsDeleting(false); // Stop delete loading indicator
    }
  };

  const handleToggleActive = async (userToToggle) => {
    if (actionLoading || isDeleting || isToggling) return;

    setIsToggling(true);
    setError(null);

    const newIsActive = !userToToggle.isActive;

    try {
      const res = await fetch(`${API_BASE}/api/admin/user/active?userId=${userToToggle.userId}&isActive=${newIsActive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }

      if (!res.ok) {
        let errorMsg = `Không thể cập nhật trạng thái. (Lỗi ${res.status})`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.userId === userToToggle.userId
            ? { ...u, isActive: newIsActive }
            : u
        )
      );

    } catch (err) {
      console.error("Toggle Active Error:", err);
      setError(err.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setIsToggling(false);
    }
  };

  // --- Close Confirmation Modal ---
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDeleteId(null);
    setError(null); // Clear error related to delete confirmation
  };

  // Initial loading state screen
  if (loading && !userInfo) {
    return (
      <div className="dashboard-container">
        <Sidebar userName={"Đang tải..."} userRole={"Admin"} />
        <main className="main-content loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </main>
      </div>
    );
  }

  // Main component render
  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo?.fullName || "Admin"} userRole={userInfo?.role || "ADMIN"} />

      <main className="main-content">
        <header className="page-header">
          <h1> <FaUserCog /> Quản lý người dùng </h1>
          <p>Thêm, chỉnh sửa và quản lý người dùng trong hệ thống.</p>
        </header>

        {/* Display General Errors (fetch errors, delete errors) when FORM IS CLOSED */}
        {error && !showForm && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Filter and Add Button Bar */}
        <div className="actions-bar">
          <div className="filter-group">
            <label htmlFor="roleFilter"><FaFilter /> Lọc vai trò:</label>
            <select id="roleFilter" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="staff">Staff</option>
              <option value="technician">Technician</option>
              <option value="customer">Customer</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="centerFilter">Trung tâm:</label>
            <select id="centerFilter" value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)}>
              <option value="all">Tất cả</option>     
              <option value="none">— Không có —</option>
              {centerList.map(centerName => (
                <option key={centerName} value={centerName}>
                  {centerName}
                </option>
              ))}
            </select>
          </div>

          {/* 3. THÊM FILTER TRẠNG THÁI (ACTIVE) */}
          <div className="filter-group">
            <label htmlFor="activeFilter">Trạng thái:</label>
            <select id="activeFilter" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="true">Đã kích hoạt</option>
              <option value="false">Chưa kích hoạt</option>
            </select>
          </div>
          <button className="btn-add" onClick={() => openForm()} disabled={actionLoading || isDeleting || isToggling}>
            <FaPlus /> Thêm người dùng
          </button>
        </div>

        {/* User List Table */}
        <div className="table-card">
          {/* Show overlay spinner when reloading data after add/edit/delete */}
          {(loading && users.length > 0) && <div className="table-loading-overlay"><FaSpinner className="spinner" /> Đang tải lại...</div>}
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
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.centerName || "—"}</td>
                      <td>
                        {(user.role !== 'ADMIN') ? (
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={!!user.isActive}
                              onChange={() => handleToggleActive(user)}
                              disabled={actionLoading || isDeleting || isToggling}
                            />
                            <span className="slider"></span>
                          </label>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="action-buttons-cell">
                        <button className="btn-action btn-edit" onClick={() => openForm(user)} disabled={actionLoading || isDeleting || isToggling}>
                          <FaEdit /> Sửa
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDeleteClick(user.userId)} disabled={actionLoading || isDeleting || isToggling}>
                          <FaTrash /> Xóa
                        </button>
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

        {/* Add/Edit User Modal Form */}
        {showForm && (
          <div className="modal-overlay" onClick={() => !actionLoading && setShowForm(false)}> {/* Prevent closing while saving */}
            <div className="modal user-edit-modal" onClick={(e) => e.stopPropagation()}> {/* Added specific class */}
              <h2>{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h2>

              {/* Display General Submit Errors INSIDE Modal */}
              {error && (
                <div className="error-message form-error">
                  <FaExclamationTriangle /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="user-form" noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName">Họ tên:</label>
                  <input
                    type="text" id="fullName" name="fullName"
                    value={formData.fullName} onChange={handleChange}
                    className={formErrors.fullName ? 'input-error' : ''}
                    aria-describedby="fullNameError" aria-invalid={!!formErrors.fullName}
                  />
                  {formErrors.fullName && <span id="fullNameError" className="error-text">{formErrors.fullName}</span>}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    className={formErrors.email ? 'input-error' : ''}
                    aria-describedby="emailError" aria-invalid={!!formErrors.email}
                  />
                  {formErrors.email && <span id="emailError" className="error-text">{formErrors.email}</span>}
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại:</label>
                  <input
                    type="tel" id="phone" name="phone"
                    value={formData.phone} onChange={handleChange}
                    className={formErrors.phone ? 'input-error' : ''}
                    aria-describedby="phoneError" aria-invalid={!!formErrors.phone}
                  />
                  {formErrors.phone && <span id="phoneError" className="error-text">{formErrors.phone}</span>}
                </div>

                {/* Password (only for new user) */}
                {!editingUser && (
                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                      type="password" id="password" name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Tối thiểu 6 ký tự"
                      className={formErrors.password ? 'input-error' : ''}
                      aria-describedby="passwordError" aria-invalid={!!formErrors.password}
                    />
                    {formErrors.password && <span id="passwordError" className="error-text">{formErrors.password}</span>}
                  </div>
                )}

                {/* Role */}
                <div className="form-group">
                  <label htmlFor="role">Vai trò:</label>
                  <select
                    id="role" name="role"
                    value={formData.role} onChange={handleChange}
                    className={formErrors.role ? 'input-error' : ''}
                    aria-describedby="roleError" aria-invalid={!!formErrors.role}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {/* Exclude ADMIN role from dropdown */}
                    <option value="STAFF">Staff</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  {formErrors.role && <span id="roleError" className="error-text">{formErrors.role}</span>}
                </div>

                {/* Center ID */}
                <div className="form-group">
                  <label htmlFor="centerId">Center ID:</label>
                  <input
                    type="number" id="centerId" name="centerId"
                    value={formData.centerId} onChange={handleChange}
                    min="1"
                    disabled={formData.role === "CUSTOMER"} // Disable if role is Customer
                    placeholder={formData.role === "CUSTOMER" ? "Không áp dụng" : "Nhập Center ID"}
                    className={formErrors.centerId ? 'input-error' : ''}
                    aria-describedby="centerIdError" aria-invalid={!!formErrors.centerId}
                  />
                  {formData.role === "CUSTOMER" && (
                    <small className="field-hint">Customer không thuộc trung tâm nào.</small>
                  )}
                  {formErrors.centerId && <span id="centerIdError" className="error-text">{formErrors.centerId}</span>}
                </div>

                {/* Form Actions */}
                <div className="form-actions">
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

        {/* --- Confirmation Modal for Deletion --- */}
        <ConfirmationModal
          show={showConfirmModal}
          message={`Bạn có chắc chắn muốn xóa người dùng ID: ${userToDeleteId}? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting} // Pass the delete loading state
        />

      </main>
    </div>
  );
}