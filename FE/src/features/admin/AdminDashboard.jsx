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
  FaTimes,
  FaCheck,
  FaSearch
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
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";


// ===== Validation helpers =====
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
  return phoneRegex.test(phone);
};


export default function AdminDashboard() {

  // ===== Global state =====
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [centers, setCenters] = useState([]);
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // ===== FIXED: userInfo state (was missing) =====
  const [userInfo, setUserInfo] = useState({
    fullName: "Admin",
    role: "ADMIN",
  });

  const getToken = () => localStorage.getItem("token");
  const token = getToken();
  const navigate = useNavigate();

  // form
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    centerId: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete & Toggle
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);


  // ===== Fetch User Info =====
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch user info:", res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("User info response invalid:", contentType);
        return;
      }

      const data = await res.json();

      setUserInfo({
        fullName: data.fullName || "Admin",
        role: data.role || "ADMIN"
      });

      localStorage.setItem("fullName", data.fullName || "Admin");
      localStorage.setItem("role", data.role || "ADMIN");

    } catch (err) {
      console.error("Fetch User Info Error:", err);
    }
  };


  // ===== Fetch Centers =====
  const fetchCenters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/service-centers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch centers:", res.status);
        return;
      }

      const data = await res.json();
      setCenters(data);

    } catch (err) {
      console.error("Fetch centers error:", err);
    }
  };


  // ===== Fetch Users =====
  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (!res.ok) {
        setError(`Lỗi tải danh sách người dùng (${res.status})`);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Users response invalid:", text.substring(0, 200));
        setError("API trả về dữ liệu không hợp lệ.");
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };


  // ===== Initial Load =====
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchUserInfo();
    fetchUsers();
    fetchCenters();
  }, [token, navigate]);


  // ===== Memoized center list =====
  const centerList = useMemo(() => {
    const c = users.map(u => u.centerName).filter(Boolean);
    return [...new Set(c)].sort();
  }, [users]);


  // ===== Filter Users =====
  const filteredUsers = users
    .filter(u => filterRole === "all" ? true : (u.role?.toLowerCase() === filterRole.toLowerCase()))
    .filter(u => {
      if (filterCenter === "all") return true;
      if (filterCenter === "none") return !u.centerName;
      return u.centerName === filterCenter;
    })
    .filter(u => {
      if (filterActive === "all") return true;
      if (filterActive === "true") return !!u.isActive;
      if (filterActive === "false") return !u.isActive;
      return true;
    })
    .filter(u => {
      const keyword = searchTerm.toLowerCase().trim();
      if (!keyword) return true;
      return (
        u.fullName?.toLowerCase().includes(keyword) ||
        u.email?.toLowerCase().includes(keyword) ||
        u.phone?.toLowerCase().includes(keyword)
      );
    });


  // ===== Handle Change =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "role" && value === "CUSTOMER") {
        newData.centerId = "";
      }
      return newData;
    });

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }

    if (error) setError(null);
  };


  // ===== Open Form =====
  const openForm = (user = null) => {
    setEditingUser(user);
    setFormErrors({});
    setError(null);
    setShowForm(true);

    if (user) {
      setFormData({
        userId: user.userId,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        centerId: user.centerId || "",
        password: "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        centerId: "",
        password: "",
      });
    }
  };


  // ===== Validate Form =====
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên không được để trống.";
    }
    if (!formData.email || !isValidEmail(formData.email.trim())) {
      errors.email = "Email không đúng định dạng.";
    }
    if (!formData.phone || !isValidPhone(formData.phone.trim())) {
      errors.phone = "Số điện thoại không đúng định dạng.";
    }
    if (!formData.role) {
      errors.role = "Vui lòng chọn vai trò.";
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    const centerIdValue = formData.centerId ? String(formData.centerId).trim() : "";
    if (
      ["STAFF", "TECHNICIAN", "MANAGER"].includes(formData.role) &&
      (!centerIdValue || isNaN(parseInt(centerIdValue)) || parseInt(centerIdValue) <= 0)
    ) {
      errors.centerId = "Center ID là bắt buộc.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // ===== Submit Form =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setActionLoading(true);

    try {
      const method = editingUser ? "PUT" : "POST";
      const endpoint = editingUser
        ? `${API_BASE_URL}/api/admin/users-update?userIdToUpdate=${editingUser.userId}`
        : `${API_BASE_URL}/api/admin/users-create`;

      const body = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        ...(editingUser ? {} : { password: formData.password }),
        ...((formData.role !== "CUSTOMER" && formData.centerId) && {
          centerId: parseInt(formData.centerId)
        })
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errorMsg = "Có lỗi khi lưu.";
        try {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;

          if (errData.fieldErrors) {
            setFormErrors(prev => ({ ...prev, ...errData.fieldErrors }));
          }

        } catch (e) {}
        throw new Error(errorMsg);
      }

      await fetchUsers();
      setShowForm(false);
      setEditingUser(null);

    } catch (err) {
      setError(err.message || "Không thể thực hiện yêu cầu.");
    } finally {
      setActionLoading(false);
    }
  };


  // ===== Delete User =====
  const handleDeleteClick = (id) => {
    setUserToDeleteId(id);
    setShowConfirmModal(true);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!userToDeleteId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userToDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (!res.ok) {
        let msg = "Không thể xóa người dùng.";
        try {
          const errData = await res.json();
          msg = errData.message || msg;
        } catch (e) {}
        throw new Error(msg);
      }

      setShowConfirmModal(false);
      setUserToDeleteId(null);
      fetchUsers();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDeleteId(null);
    setError(null);
  };


  // ===== Toggle Active =====
  const handleToggleActive = async (user) => {
    if (actionLoading || isDeleting || isToggling) return;

    setIsToggling(true);
    setError(null);

    const newIsActive = !user.isActive;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/user/active?userId=${user.userId}&isActive=${newIsActive}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        let msg = `Không thể cập nhật trạng thái. (Lỗi ${res.status})`;
        try {
          const errData = await res.json();
          msg = errData.message || msg;
        } catch {}
        throw new Error(msg);
      }

      setUsers(prev =>
        prev.map(u =>
          u.userId === user.userId ? { ...u, isActive: newIsActive } : u
        )
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsToggling(false);
    }
  };


  // ===== Loading Screen =====
  if (showLoading) {
    return <Loading text="Đang tải dữ liệu người dùng..." />;
  }


  // ===== Render =====
  return (
    <div className="dashboard-container">
      
      <Sidebar
        userName={userInfo?.fullName || "Admin"}
        userRole={userInfo?.role || "ADMIN"}
      />

      <main className="main-content">

        <header className="page-header">
          <h1><FaUserCog /> Quản lí người dùng</h1>
          <p>Thêm, chỉnh sửa và quản lý người dùng trong hệ thống.</p>
        </header>

        {error && !showForm && (
          <div className="error-message general-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="filters-wrapper">
          <div className="search-box-admin">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <FiltersBar
            filterRole={filterRole} setFilterRole={setFilterRole}
            filterCenter={filterCenter} setFilterCenter={setFilterCenter}
            filterActive={filterActive} setFilterActive={setFilterActive}
            centerList={centerList}
            onAddClick={() => openForm()}
            disabled={actionLoading || isDeleting || isToggling}
          />
        </div>

        <UserTable
          filteredUsers={filteredUsers}
          loading={loading}
          actionLoading={actionLoading}
          isDeleting={isDeleting}
          isToggling={isToggling}
          onEdit={(user) => openForm(user)}
          onDelete={handleDeleteClick}
          onToggleActive={handleToggleActive}
        />

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

        <ConfirmationModal
          visible={showConfirmModal}
          message={`Bạn có chắc chắn muốn xóa người dùng ID: ${userToDeleteId}?`}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          loading={isDeleting}
        />

      </main>
    </div>
  );
}
