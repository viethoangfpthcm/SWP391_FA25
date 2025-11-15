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
// 

if (import.meta.env.MODE !== "development") {
}

export default function AdminDashboard() {
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
  const getToken = () => localStorage.getItem("token");
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
  const navigate = useNavigate();

  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isToggling, setIsToggling] = useState(false);

  const token = localStorage.getItem("token");

 
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
      setCenters(data);
    } catch (err) {
      console.error("Fetch centers error:", err);
    }
  };

 
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
    })
    .filter(user => {
      const keyword = searchTerm.toLowerCase().trim();
      if (!keyword) return true;
      return (
        user.fullName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword)
      );
    });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
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
        fullName: "", email: "", phone: "", role: "", centerId: "", password: "",
      });
    }
  };


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
   
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
  
    const centerIdValue = formData.centerId ? String(formData.centerId).trim() : "";
    if ((formData.role === "STAFF" || formData.role === "TECHNICIAN" || formData.role === "MANAGER") && (centerIdValue === "" || isNaN(parseInt(centerIdValue)) || parseInt(centerIdValue) <= 0)) {
      errors.centerId = "Center ID là bắt buộc cho Staff/Technician/Manager.";
    }

    setFormErrors(errors); 
    return Object.keys(errors).length === 0; 
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    if (!validateForm()) {
      return;
    }

    setActionLoading(true); 

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
        body: JSON.stringify(requestBody),
      });


      if (!res.ok) {
        let errorMsg = "Có lỗi xảy ra khi lưu.";
        let fieldErrors = {};
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorData.error || `Lỗi ${res.status}`;
        
          if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
            fieldErrors = errorData.fieldErrors;
            setFormErrors(prev => ({ ...prev, ...fieldErrors })); 
            errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin."; 
          }
        } catch (parseError) {
          errorMsg = `Lỗi ${res.status}. Không thể đọc chi tiết lỗi.`;
        }
        throw new Error(errorMsg); 
      }

      // --- Success ---
      await fetchUsers();   
      setShowForm(false);   
      setEditingUser(null); 


    } catch (err) {
      console.error("Submit error:", err);
      
      setError(err.message || "Không thể thực hiện yêu cầu.");
    } finally {
      setActionLoading(false); 
    }
  };

  
  const handleDeleteClick = (userId) => {
    setUserToDeleteId(userId); 
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

   
      setShowConfirmModal(false); 
      setUserToDeleteId(null);
      await fetchUsers(); 


    } catch (err) {
      console.error("Delete Error:", err);
      
      setError(err.message || "Xóa người dùng thất bại.");
    } finally {
      setIsDeleting(false); 
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


  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDeleteId(null);
    setError(null); 
  };

  if (showLoading) {
    return (
      <Loading text="Đang tải dữ liệu người dùng..." />
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar userName={userInfo?.fullName || "Admin"} userRole={userInfo?.role || "ADMIN"} />

      <main className="main-content">
        <header className="page-header">
          <h1> <FaUserCog /> Quản lí người dùng </h1>
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
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
          onDelete={(id) => handleDeleteClick(id)}
          onToggleActive={(user) => handleToggleActive(user)}
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
          message={`Bạn có chắc chắn muốn xóa người dùng ID: ${userToDeleteId}? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          loading={isDeleting} 
        />

      </main>
    </div>
  );
}