import React, { useState, useEffect } from "react";
import { FaCog, FaExclamationTriangle, FaSearch, FaEye } from "react-icons/fa";
import Sidebar from "@components/layout/Sidebar.jsx";
import Loading from "@components/ui/Loading.jsx";
import Button from "@components/ui/Button.jsx";
import { API_BASE_URL } from "@config/api.js";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";
import "./StaffPartsView.css";

const StaffPartsView = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const showLoading = useMinimumDelay(loading, 1000);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user info:", err);
      }
    }
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/staff/parts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách phụ tùng");
      }

      const data = await response.json();
      console.log("Staff parts data:", data);
      setParts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching parts:", err);
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = parts.filter((part) => {
    const search = searchTerm.toLowerCase();
    return (
      part.name?.toLowerCase().includes(search) ||
      part.id?.toString().includes(search) ||
      part.description?.toLowerCase().includes(search) ||
      part.partType?.name?.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="main-content staff-part">
        <header className="page-header">
          <h1>
            <FaCog /> Danh sách phụ tùng
          </h1>
          <p className="read-only-badge">
            <FaEye /> Chế độ xem - Chỉ đọc
          </p>
        </header>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {showLoading ? (
          <div className="loading-container">
            <Loading text="Đang tải danh sách phụ tùng..." />
          </div>
        ) : (
          <>
            <div className="parts-toolbar">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm phụ tùng (tên, ID, hãng)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="parts-count">
                Tổng: <strong>{filteredParts.length}</strong> phụ tùng
              </div>
            </div>

            <div className="table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên phụ tùng</th>
                      <th>Loại</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Chi phí vật liệu</th>
                      <th>Chi phí nhân công</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.length > 0 ? (
                      filteredParts.map((part) => (
                        <tr key={part.id}>
                          <td>
                            <span className="cell-main">#{part.id}</span>
                          </td>
                          <td>
                            <span className="cell-main">{part.name}</span>
                          </td>
                          <td>
                            <span className="cell-sub">
                              {part.partType?.name || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`stock-badge ${part.quantity > 10
                                ? "stock-high"
                                : part.quantity > 0
                                  ? "stock-low"
                                  : "stock-out"
                                }`}
                            >
                              {part.quantity || 0}
                            </span>
                          </td>
                          <td>
                            <span className="cell-main">
                              {formatCurrency(part.unitPrice || 0)}
                            </span>
                          </td>
                          <td>
                            <span className="cell-sub">
                              {formatCurrency(part.materialCost || 0)}
                            </span>
                          </td>
                          <td>
                            <span className="cell-sub">
                              {formatCurrency(part.laborCost || 0)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${part.quantity > 0 ? "status-available" : "status-out"
                                }`}
                            >
                              {part.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="empty-state">
                          {searchTerm
                            ? `Không tìm thấy phụ tùng nào với từ khóa "${searchTerm}"`
                            : "Chưa có phụ tùng nào trong hệ thống"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StaffPartsView;

