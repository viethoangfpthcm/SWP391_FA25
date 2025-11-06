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
import Sidebar from "@components/layout/Sidebar.jsx"; // �?m b?o du?ng d?n d�ng
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

  const token = localStorage.getItem("token");

  // Fetch current admin user info
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
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
        setError(`L?i t?i danh s�ch ngu?i d�ng (${res.status})`);
        setLoading(false);
        return;
      }
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Users response is not JSON:", contentType);
        const text = await res.text();
        console.error("Response body:", text.substring(0, 200));
        setError("API tr? v? d? li?u kh�ng h?p l?. Vui l�ng ki?m tra backend.");
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Kh�ng th? t?i danh s�ch ngu?i d�ng. Vui l�ng th? l?i.");
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
    // L?y t?t c? 'centerName' c� trong danh s�ch users
    const centers = users
      .map(user => user.centerName)
      .filter(Boolean); // L?c b? c�c gi� tr? null/undefined/""

    // D�ng Set d? l?y duy nh?t v� sort theo ABC
    return [...new Set(centers)].sort();
  }, [users]); // Ch? ch?y l?i khi 'users' thay d?i

  // --- Logic L?c Chu?i (Role -> Center -> Active) ---
  const filteredUsers = users
    .filter(user => {
      // 1. L?c theo Role
      if (filterRole === "all") return true;
      return user.role && user.role.toLowerCase() === filterRole.toLowerCase();
    })
    .filter(user => {
      // 2. L?c theo Center
      if (filterCenter === "all") return true;
      if (filterCenter === "none") return !user.centerName;
      return user.centerName === filterCenter;
    })
    .filter(user => {
      // 3. L?c theo Tr?ng th�i Active
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
      errors.fullName = "H? t�n kh�ng du?c d? tr?ng.";
    }
    if (!formData.email || !isValidEmail(formData.email.trim())) {
      errors.email = "Email kh�ng d�ng d?nh d?ng.";
    }
    if (!formData.phone || !isValidPhone(formData.phone.trim())) {
      errors.phone = "S? di?n tho?i kh�ng d�ng d?nh d?ng VN (10 s?).";
    }
    if (!formData.role) {
      errors.role = "Vui l�ng ch?n vai tr�.";
    }
    // Password required only when adding a new user
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "M?t kh?u ph?i c� �t nh?t 6 k� t?.";
    }
    // Center ID required (and must be positive number) for Staff/Technician
    const centerIdValue = formData.centerId ? String(formData.centerId).trim() : "";
    if ((formData.role === "STAFF" || formData.role === "TECHNICIAN") && (centerIdValue === "" || isNaN(parseInt(centerIdValue)) || parseInt(centerIdValue) <= 0)) {
      errors.centerId = "Center ID l� b?t bu?c (s? duong) cho Staff/Technician.";
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
        let errorMsg = "�� c� l?i x?y ra khi luu.";
        let fieldErrors = {};
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `L?i ${res.status}`;
          // Check if backend returned field-specific errors
          if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
            fieldErrors = errorData.fieldErrors;
            setFormErrors(prev => ({ ...prev, ...fieldErrors })); // Set field errors state
            errorMsg = "D? li?u kh�ng h?p l?. Vui l�ng ki?m tra l?i c�c tru?ng."; // More generic message
          }
        } catch (parseError) {
          errorMsg = `L?i ${res.status}. Kh�ng th? d?c chi ti?t l?i.`;
        }
        throw new Error(errorMsg); // Throw error to be caught below
      }

      // --- Success ---
      await fetchUsers();   // Refresh the user list on success
      setShowForm(false);   // Close the modal
      setEditingUser(null); // Reset editing state
      // Consider adding a success toast here: toast.success('Luu th�nh c�ng!');

    } catch (err) {
      console.error("Submit error:", err);
      // Display general submit error inside the modal
      setError(err.message || "Kh�ng th? th?c hi?n y�u c?u.");
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
        let errorMsg = "Kh�ng th? x�a ngu?i d�ng.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `L?i ${res.status}`;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      // --- Success ---
      setShowConfirmModal(false); // Close confirmation modal
      setUserToDeleteId(null);
      await fetchUsers(); // Refresh user list
      // Consider adding a success toast here: toast.success('X�a th�nh c�ng!');

    } catch (err) {
      console.error("Delete Error:", err);
      // Display error (can be shown as general error or inside confirmation modal if kept open)
      setError(err.message || "X�a ngu?i d�ng th?t b?i.");
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
        let errorMsg = `Kh�ng th? c?p nh?t tr?ng th�i. (L?i ${res.status})`;
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
      setError(err.message || "C?p nh?t tr?ng th�i th?t b?i.");
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
        <Sidebar userName={"�ang t?i..."} userRole={"Admin"} />
        <main className="main-content loading-state">
          <Loading inline />
          <p>�ang t?i d? li?u...</p>
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
          <h1> <FaUserCog /> Qu?n l� ngu?i d�ng </h1>
          <p>Th�m, ch?nh s?a v� qu?n l� ngu?i d�ng trong h? th?ng.</p>
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
        />

        {/* --- Confirmation Modal for Deletion --- */}
        <ConfirmationModal
          show={showConfirmModal}
          message={`B?n c� ch?c ch?n mu?n x�a ngu?i d�ng ID: ${userToDeleteId}? H�nh d?ng n�y kh�ng th? ho�n t�c.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isDeleting} // Pass the delete loading state
        />

      </main>
    </div>
  );
}