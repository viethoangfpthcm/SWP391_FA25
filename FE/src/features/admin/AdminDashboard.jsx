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
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "@components/ui/ConfirmationModal.jsx";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import FiltersBar from './shared/FiltersBar.jsx';
import UserTable from './shared/UserTable.jsx';
import UserForm from './shared/UserForm.jsx';
import { API_BASE_URL } from "@config/api.js";

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
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [centers, setCenters] = useState([]);
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
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // --- States for Confirmation Modal ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state specifically for delete action
  const [isToggling, setIsToggling] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch current admin user info
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }
      if (!res.ok) {
        console.error("Failed to fetch user info:", res.status);
        return;
      }

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("User info response is not JSON:", contentType);
        return;
      }

      const data = await res.json();
      localStorage.setItem("fullName", data.fullName || "Admin");
      localStorage.setItem("role", data.role || "ADMIN");
      setUserInfo({ fullName: data.fullName, role: data.role });
    } catch (err) {
      console.error("Fetch User Info Error:", err);
      // Displaying error might be annoying here if transient
    }
  };

  const fetchCenters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }
      if (!res.ok) {
        console.error("Failed to fetch centers:", res.status);
        return;
      }
      const data = await res.json();
      setCenters(data); // [{id, name, address,...}]
    } catch (err) {
      console.error("Fetch centers error:", err);
    }
  };

  // Fetch list of users
  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear(); navigate("/"); return;
      }
      if (!res.ok) {
        setError(`Lỗi tải danh sách người dùng (${res.status})`);
        setLoading(false);
        return;
      }

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Users response is not JSON:", contentType);
        const text = await res.text();
        console.error("Response body:", text.substring(0, 200));
        setError("API trả về dữ liệu không hợp lệ. Vui lòng kiểm tra backend.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Không thể tải danh sách nguời dùng. Vui lòng thử lại.");
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
    fetchCenters();
  }, [token, navigate]);

  const centerList = useMemo(() => {

    const centers = users
      .map(user => user.centerName)
      .filter(Boolean);


    return [...new Set(centers)].sort();
  }, [users]);


  const filteredUsers = users
    .filter(user => {

      if (filterRole === "all") return true;
      return user.role && user.role.toLowerCase() === filterRole.toLowerCase();
    })
    .filter(user => {

      if (filterCenter === "all") return true;
      if (filterCenter === "none") return !user.centerName;
      return user.centerName === filterCenter;
    })
    .filter(user => {
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
    if ((formData.role === "STAFF" || formData.role === "TECHNICIAN" || formData.role === "MANAGER") && (centerIdValue === "" || isNaN(parseInt(centerIdValue)) || parseInt(centerIdValue) <= 0)) {
      errors.centerId = "Center ID là bắt buộc cho Staff/Technician/Manager.";
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
        ? `${API_BASE_URL}/api/admin/users-update?userIdToUpdate=${editingUser.userId}`
        : `${API_BASE_URL}/api/admin/users-create`;
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
        let errorMsg = "Có lỗi xảy ra khi lưu.";
        let fieldErrors = {};
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
          // Check if backend returned field-specific errors
          if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
            fieldErrors = errorData.fieldErrors;
            setFormErrors(prev => ({ ...prev, ...fieldErrors })); // Set field errors state
            errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin."; // More generic message
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
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userToDeleteId}`, {
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


    } catch (err) {
      console.error("Delete Error:", err);
      // Display error 
      setError(err.message || "Xóa người dùng thất bại.");
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
      const res = await fetch(
        `${API_BASE_URL}/api/admin/user/active?userId=${userToToggle.userId}&isActive=${newIsActive}`,
        {
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
          <Loading inline />
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
          <h1> <FaUserCog /> Quản lí người dùng </h1>
          <p>Thêm, chỉnh sửa và quản lý người dùng trong hệ thống.</p>
        </header>

        {/* Display General Errors (fetch errors, delete errors) when FORM IS CLOSED */}
        {error && !showForm && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Filter and Add Button Bar (extracted) */}
        <FiltersBar
          filterRole={filterRole} setFilterRole={setFilterRole}
          filterCenter={filterCenter} setFilterCenter={setFilterCenter}
          filterActive={filterActive} setFilterActive={setFilterActive}
          centerList={centerList}
          onAddClick={() => openForm()}
          disabled={actionLoading || isDeleting || isToggling}
        />

        {/* User List Table (extracted) */}
        <UserTable
          filteredUsers={filteredUsers}
          loading={loading}
          actionLoading={actionLoading}
          isDeleting={isDeleting}
          isToggling={isToggling}
          onEdit={(user) => openForm(user)}
          onDelete={(id) => handleDeleteClick(id)}
          onToggleActive={(user) => handleToggleActive(user)}
        />

        {/* Add/Edit User Modal Form (extracted) */}
        <UserForm
          showForm={showForm}
          editingUser={editingUser}
          formData={formData}
          formErrors={formErrors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          actionLoading={actionLoading}
          onClose={() => { setShowForm(false); setEditingUser(null); }}
          error={error}
          centers={centers}
        />

        {/* --- Confirmation Modal for Deletion --- */}
        <ConfirmationModal
          visible={showConfirmModal}
          message={`Bạn có chắc chắn muốn xóa người dùng ID: ${userToDeleteId}? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          loading={isDeleting} // Pass the delete loading state
        />

      </main>
    </div>
  );
}