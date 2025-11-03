import React, { useState, useEffect } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import FiltersBar from "./shared/UserFiltersBar";
import UserTable from "./shared/UserTable";
import "./UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/manager/users", {
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
    return (
      <div className="user-management-loading">
        <Loading inline />
      </div>
    );
  }

  return (
    <div className="user-management">

      <FiltersBar
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
      />

      <UserTable users={filteredUsers} loading={loading} />
    </div>
  );
}
