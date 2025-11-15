import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@config/api.js";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import Sidebar from "@components/layout/Sidebar.jsx";
import { FaPlus, FaEdit, FaBox, FaExclamationTriangle, FaSearch} from "react-icons/fa";
import FiltersBar from "./shared/PartFiltersBar";
import PartTable from "./shared/PartTable";
import PartForm from "./shared/PartForm";
import RestockRequestModal from "./shared/RestockRequestModal";
import "./PartManagement.css";
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";

export default function PartManagement() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitPrice: "",
    quantity: "",
    manufacturer: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/parts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setParts(data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      description: "",
      unitPrice: "",
      quantity: "",
      manufacturer: "",
    });
    setShowForm(true);
    setError(null);
  };

  const handleEditClick = async (part) => {
    setActionLoading(`view-${part.id}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/parts/${part.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEditingPart(data);
        setFormData({
          name: data.name,
          description: data.description,
          unitPrice: data.unitPrice,
          quantity: data.quantity,
          manufacturer: data.manufacturer,
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error fetching part details:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestockRequest = (part) => {
    setSelectedPart(part);
    setShowRestockModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading("submit");
    setError(null);

    try {
      const url = editingPart
        ? `${API_BASE_URL}/api/manager/parts/${editingPart.id}`
        : `${API_BASE_URL}/api/manager/parts-create`;
      const method = editingPart ? "PUT" : "POST";

      // Nếu đang edit: gửi toàn bộ thông tin cần thiết
      const body = editingPart
        ? {
          name: editingPart.name || "",
          description: editingPart.description || "",
          unitPrice: Number(editingPart.unitPrice) || 0,
          quantity: parseInt(formData.quantity) || 0,
          materialCost: Number(editingPart.materialCost || editingPart.materialcost) || 0,
          laborCost: Number(editingPart.laborCost) || 0,
          partTypeId: editingPart.partType?.id || editingPart.partTypeId || 0,
        }
        : {
          name: formData.name,
          description: formData.description,
          unitPrice: parseFloat(formData.unitPrice),
          quantity: parseInt(formData.quantity),
          manufacturer: formData.manufacturer,
        };


      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchParts();
        setShowForm(false);
        setEditingPart(null);
        setFormData({
          name: "",
          unitPrice: "",
          quantity: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving part:", error);
      setError("Không thể lưu phụ tùng");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredParts = parts.filter((part) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      part.name?.toLowerCase().includes(search) ||
      part.id?.toString().includes(search) ||
      part.description?.toLowerCase().includes(search) ||
      part.manufacturer?.toLowerCase().includes(search) ||
      part.partType?.name?.toLowerCase().includes(search);

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "in-stock") return matchesSearch && part.quantity > 10;
    if (filterStatus === "low-stock") return matchesSearch && part.quantity > 0 && part.quantity <= 10;
    if (filterStatus === "out-of-stock") return matchesSearch && part.quantity === 0;
    return matchesSearch;
  });

  const lowStockCount = parts.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStockCount = parts.filter((p) => p.quantity === 0).length;

  if (showLoading) {
    return (
      <Loading text="Đang tải phụ tùng..." />
    );
  }

  return (
    <div className="admin-dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={localStorage.getItem("fullName")}
        userRole={localStorage.getItem("role")}
      />
      <main className="admin-main-content">
        <header className="admin-header">
          <div>
            <h1>
              <FaBox /> Quản lý phụ tùng
            </h1>
            <p className="subtitle">Quản lý kho phụ tùng và yêu cầu nhập hàng</p>
          </div>

        </header>

        <div className="admin-content">
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="stock-alerts">
              {lowStockCount > 0 && (
                <div className="alert alert-warning">
                  <FaExclamationTriangle />
                  <span>
                    Có <strong>{lowStockCount}</strong> phụ tùng sắp hết hàng
                  </span>
                </div>
              )}
              {outOfStockCount > 0 && (
                <div className="alert alert-danger">
                  <FaExclamationTriangle />
                  <span>
                    Có <strong>{outOfStockCount}</strong> phụ tùng đã hết hàng
                  </span>
                </div>
              )}
            </div>
          )}

          <FiltersBar filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

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

          <PartTable
            parts={filteredParts}
            loading={loading}
            actionLoading={actionLoading}
            onEdit={handleEditClick}
            onRestockRequest={handleRestockRequest}
          />
        </div>

        {showForm && (
          <PartForm
            showForm={showForm}
            editingPart={editingPart}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            actionLoading={actionLoading}
            onClose={() => {
              setShowForm(false);
              setEditingPart(null);
              setError(null);
            }}
            error={error}
          />
        )}

        {showRestockModal && (
          <RestockRequestModal
            part={selectedPart}
            onClose={() => {
              setShowRestockModal(false);
              setSelectedPart(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
