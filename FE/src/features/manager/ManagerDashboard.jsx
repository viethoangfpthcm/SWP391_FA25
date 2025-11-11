import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@components/layout/Sidebar.jsx";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import FiltersBar from "./shared/UserFiltersBar";
import UserTable from "./shared/UserTable";
import "./ManagerDashboard.css";
import { API_BASE_URL } from "@config/api.js";

export default function ManagerDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  

  useEffect(() => {
    fetchUserInfo();
    fetchUsers();
  }, []);

  const fetchUserInfo = async () => {
    const role = localStorage.getItem("role");
    
    if (!token) {
      navigate("/");
      return;
    }

    if (role !== "MANAGER") {
      navigate("/home");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/account/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        setUserInfo({
          fullName: localStorage.getItem("fullName") || "Manager",
          role: role,
          centerName: "Trung tâm của bạn"
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUserInfo({
        fullName: localStorage.getItem("fullName") || "Manager",
        role: role,
        centerName: "Trung tâm của bạn"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = filterRole === "all" || user.role === filterRole;
    const activeMatch =
      filterActive === "all" ||
      (filterActive === "active" && user.active) ||
      (filterActive === "inactive" && !user.active);
    return roleMatch && activeMatch;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1>
              <FaUserPlus /> Quản lý người dùng
            </h1>
            <p className="subtitle">
              Quản lý người dùng trong nội bộ hệ thống.
            </p>
          </div>
        </header>

        <div className="admin-content">
          <FiltersBar
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterActive={filterActive}
            setFilterActive={setFilterActive}
          />

          <UserTable users={filteredUsers} loading={loading} />
        </div>
      </main>
    </div>
  );
}
