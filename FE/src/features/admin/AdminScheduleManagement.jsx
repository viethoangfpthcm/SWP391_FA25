import React, { useState, useEffect } from "react";
import {
    FaCalendarAlt,
    FaFilter,
    FaExclamationTriangle,
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaTimes,
    FaSave,
} from "react-icons/fa";
import "./AdminScheduleManagement.css";
import Sidebar from "@components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import Loading from '@components/ui/Loading.jsx';

export default function AdminScheduleManagement() {
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("view"); // view, edit, add
    const [userInfo, setUserInfo] = useState(null);
    const [filterVehicle, setFilterVehicle] = useState("all");

    const navigate = useNavigate();
    const API_BASE = "";

    const getToken = () => localStorage.getItem("token");

    // --- Lấy thông tin user ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/account/current`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });
            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
            const data = await res.json();
            localStorage.setItem("fullName", data.fullName || "Admin");
            localStorage.setItem("role", data.role || "Admin");
            setUserInfo({ fullName: data.fullName, role: data.role });
        } catch (err) {
            console.error(err);
            setError("Không thể tải thông tin người dùng.");
        }
    };

    // Fetch all schedules
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/admin/schedules`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });

            if (res.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            if (!res.ok) throw new Error("Không thể tải danh sách lịch trình");
            const data = await res.json();
            setSchedules(data);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách lịch trình.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch plans for selected schedule
    const fetchPlans = async (scheduleId) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}/plans`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });

            if (!res.ok) throw new Error("Không thể tải danh sách mốc bảo dưỡng");
            const data = await res.json();

            // Đảm bảo tất cả số đều có giá trị mặc định, không bao giờ undefined/null
            const sanitizedPlans = data.map(plan => ({
                ...plan,
                maintenanceNo: plan.maintenanceNo ?? 0,
                intervalKm: plan.intervalKm ?? 0,
                intervalMonth: plan.intervalMonth ?? 0,
                name: plan.name || "",
                description: plan.description || ""
            }));

            setPlans(sanitizedPlans);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách mốc bảo dưỡng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/");
            return;
        }

        // Lấy thông tin user và danh sách lịch trình
        fetchUserInfo();
        fetchSchedules();
    }, [navigate]);

    // Modal handlers
    const handleViewSchedule = (schedule) => {
        setSelectedSchedule({
            ...schedule,
            name: schedule.name || "",
            description: schedule.description || "",
            vehicleModel: schedule.vehicleModel || ""
        });
        fetchPlans(schedule.id);
        setModalMode("view");
        setShowModal(true);
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSchedule({
            ...schedule,
            name: schedule.name || "",
            description: schedule.description || "",
            vehicleModel: schedule.vehicleModel || ""
        });
        fetchPlans(schedule.id);
        setModalMode("edit");
        setShowModal(true);
    };

    const handleAddSchedule = () => {
        setSelectedSchedule({
            id: null,
            name: "",
            description: "",
            vehicleModel: ""
        });
        setPlans([]);
        setModalMode("add");
        setShowModal(true);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch trình này?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });

            if (!res.ok) throw new Error("Không thể xóa lịch trình");
            alert("Đã xóa lịch trình thành công");
            fetchSchedules();
        } catch (err) {
            alert("Không thể xóa lịch trình");
            console.error(err);
        }
    };

    // ✅ Sửa lại hàm này để return schedule data
    const handleSaveSchedule = async () => {
        try {
            // Validate dữ liệu
            if (!selectedSchedule?.name?.trim()) {
                alert("Vui lòng nhập tên lịch trình!");
                throw new Error("Tên lịch trình không được để trống");
            }
            if (!selectedSchedule?.vehicleModel?.trim()) {
                alert("Vui lòng nhập dòng xe!");
                throw new Error("Dòng xe không được để trống");
            }

            const query = new URLSearchParams({
                name: selectedSchedule.name.trim(),
                description: selectedSchedule.description?.trim() || "",
                vehicleModel: selectedSchedule.vehicleModel.trim(),
            }).toString();

            const bodyData = {
                name: selectedSchedule.name.trim(),
                description: selectedSchedule.description?.trim() || "",
                vehicleModel: selectedSchedule.vehicleModel.trim(),
            };

            console.log("🚀 Sending schedule data:", {
                id: selectedSchedule?.id,
                ...bodyData,
                mode: modalMode
            });

            let res;

            if (modalMode === "add") {
                // Thử cả 2 cách: query string VÀ body
                res = await fetch(`${API_BASE}/api/admin/schedules?${query}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(bodyData),
                });
            } else if (modalMode === "edit" && selectedSchedule?.id) {
                // Thử cả 2 cách: query string VÀ body
                res = await fetch(`${API_BASE}/api/admin/schedules/${selectedSchedule.id}?${query}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(bodyData),
                });
            } else {
                throw new Error("Không có ID hoặc modalMode không hợp lệ");
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ Server error:", errorText);
                throw new Error(`Lỗi server: ${res.status} - ${errorText}`);
            }

            const data = await res.json();
            console.log("✅ Schedule saved successfully:", data);

            // ✅ Cập nhật selectedSchedule với ID mới (quan trọng cho việc lưu plans)
            setSelectedSchedule(data);

            // ✅ Cập nhật lại danh sách lịch trình
            setSchedules((prev) => {
                if (modalMode === "add") return [...prev, data];
                return prev.map((s) => (s.id === data.id ? data : s));
            });

            // ✅ Trả về data để dùng cho savePlans
            return data;
        } catch (error) {
            console.error("Lỗi khi lưu lịch trình:", error);
            throw error;
        }
    };

    // Plan handlers
    const handleAddPlan = () => {
        const newPlan = {
            id: `temp_${Date.now()}`,
            scheduleId: selectedSchedule?.id,
            maintenanceNo: plans.length + 1,
            intervalKm: 0,
            intervalMonth: 0,
            name: "",
            description: "",
            isNew: true
        };
        setPlans([...plans, newPlan]);
    };

    const handleDeletePlan = async (planId, isNew) => {
        if (!window.confirm("Bạn có chắc muốn xóa mốc này?")) return;

        try {
            // Nếu là plan mới chưa lưu vào DB, chỉ cần xóa khỏi state
            if (isNew || planId.toString().startsWith('temp_')) {
                setPlans(plans.filter(p => p.id !== planId));
                return;
            }

            // Nếu là plan đã có trong DB, gọi API DELETE
            const res = await fetch(
                `${API_BASE}/api/admin/plans/${planId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${getToken()}` },
                }
            );

            if (!res.ok) throw new Error("Không thể xóa mốc");
            setPlans(plans.filter(p => p.id !== planId));
        } catch (err) {
            alert("Không thể xóa mốc");
            console.error(err);
        }
    };

    // ✅ Sửa lại hàm savePlans để nhận scheduleId
    const savePlans = async (scheduleId) => {
        try {
            const token = getToken();

            // Kiểm tra token trước khi gửi request
            if (!token) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                navigate("/");
                return;
            }

            // Lọc và lưu các plans
            for (const plan of plans) {
                // Chuẩn hóa data trước khi gửi - đảm bảo không có NaN hoặc string rỗng
                const planData = {
                    scheduleId: scheduleId, // ✅ Dùng scheduleId từ tham số
                    maintenanceNo: parseInt(plan.maintenanceNo) || 0,
                    intervalKm: parseInt(plan.intervalKm) || 0,
                    intervalMonth: parseInt(plan.intervalMonth) || 0,
                    name: plan.name || "",
                    description: plan.description || "",
                };

                if (plan.isNew || plan.id.toString().startsWith('temp_')) {
                    // Thêm plan mới
                    const res = await fetch(`${API_BASE}/api/admin/plans`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(planData),
                    });

                    if (res.status === 401 || res.status === 403) {
                        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                        localStorage.clear();
                        navigate("/");
                        return;
                    }

                    if (!res.ok) {
                        const error = await res.text();
                        throw new Error(`Không thể thêm mốc: ${error}`);
                    }
                } else if (plan.modified) {
                    // Cập nhật plan đã tồn tại
                    const res = await fetch(
                        `${API_BASE}/api/admin/plans/${plan.id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify(planData),
                        }
                    );

                    if (res.status === 401 || res.status === 403) {
                        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                        localStorage.clear();
                        navigate("/");
                        return;
                    }

                    if (!res.ok) {
                        const error = await res.text();
                        throw new Error(`Không thể cập nhật mốc: ${error}`);
                    }
                }
            }
        } catch (err) {
            console.error("Lỗi khi lưu plans:", err);
            throw err;
        }
    };

    // ✅ HÀM MỚI: Lưu cả schedule và plans
    const handleSaveAll = async () => {
        try {
            // Bước 1: Lưu schedule trước
            const savedSchedule = await handleSaveSchedule();
            
            if (!savedSchedule || !savedSchedule.id) {
                throw new Error("Không lấy được ID của lịch trình sau khi lưu");
            }

            // Bước 2: Nếu có plans đã sửa/thêm và không phải mode "add", thì lưu plans
            if (modalMode !== "add" && plans.length > 0) {
                const hasChanges = plans.some(p => p.modified || p.isNew);
                if (hasChanges) {
                    await savePlans(savedSchedule.id);
                }
            }

            alert("Đã lưu thành công!");
            setShowModal(false);
            setSelectedSchedule(null);
            setPlans([]);
            setModalMode("view");
            
            // Refresh danh sách
            await fetchSchedules();
        } catch (err) {
            alert("Có lỗi xảy ra khi lưu: " + err.message);
            console.error(err);
        }
    };

    const handlePlanChange = (planId, field, value) => {
        setPlans(plans.map(p => {
            if (p.id === planId) {
                // Xử lý giá trị number để tránh NaN
                let processedValue = value;
                if (field === 'maintenanceNo' || field === 'intervalKm' || field === 'intervalMonth') {
                    processedValue = value === '' ? 0 : parseInt(value) || 0;
                }
                return { ...p, [field]: processedValue, modified: true };
            }
            return p;
        }));
    };

    const formatKm = (km) => {
        if (!km) return "0 km";
        if (km >= 1000) return (km / 1000) + "K km";
        return km + " km";
    };

    const formatMonth = (month) => {
        if (!month) return "0 tháng";
        return month + " tháng";
    };

    // Lọc schedules theo dòng xe
    const filteredSchedules = filterVehicle === "all"
        ? schedules
        : schedules.filter(s => s.vehicleModel === filterVehicle);

    // Lấy danh sách unique vehicle models để hiển thị trong filter
    const vehicleModels = [...new Set(schedules.map(s => s.vehicleModel))];

    // Loading UI
    if (loading && !userInfo) {
        return (
            <div className="dashboard-container">
                <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
                <main className="main-content loading-state">
                    <Loading inline />
                    <p>Đang tải dữ liệu lịch trình...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar userName={userInfo?.fullName} userRole={userInfo?.role} />
            <main className="main-content">
                <header className="page-header">
                    <h1>
                        <FaCalendarAlt /> Quản lý Lịch trình Bảo dưỡng
                    </h1>
                    <p>Quản lý lịch trình và mốc bảo dưỡng cho từng dòng xe.</p>
                </header>

                {error && (
                    <div className="error-message">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                <div className="actions-bar">
                    <div className="filter-group">
                        <label htmlFor="vehicleFilter">
                            <FaFilter /> Lọc theo dòng xe:
                        </label>
                        <select
                            id="vehicleFilter"
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            {vehicleModels.map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="btn-primary" onClick={handleAddSchedule}>
                        <FaPlus /> Thêm lịch trình
                    </button>
                </div>

                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên lịch trình</th>
                                    <th>Mô tả</th>
                                    <th>Dòng xe</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            <Loading inline /> Đang tải...
                                        </td>
                                    </tr>
                                ) : filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule) => (
                                        <tr key={schedule.id}>
                                            <td>#{schedule.id}</td>
                                            <td><strong>{schedule.name}</strong></td>
                                            <td>{schedule.description}</td>
                                            <td>
                                                <span className="role-badge role-confirmed">
                                                    {schedule.vehicleModel}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => handleViewSchedule(schedule)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditSchedule(schedule)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                                        title="Xóa"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            Không có lịch trình nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {modalMode === "view" && "Chi tiết lịch trình"}
                                    {modalMode === "edit" && "Chỉnh sửa lịch trình"}
                                    {modalMode === "add" && "Thêm lịch trình mới"}
                                </h2>
                                <button className="btn-close" onClick={() => setShowModal(false)}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Schedule Info */}
                                <div className="form-section">
                                    <h3>Thông tin lịch trình</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Tên lịch trình *</label>
                                            <input
                                                type="text"
                                                value={selectedSchedule?.name || ""}
                                                onChange={(e) => setSelectedSchedule({
                                                    ...selectedSchedule,
                                                    name: e.target.value
                                                })}
                                                disabled={modalMode === "view"}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Dòng xe *</label>
                                            <input
                                                type="text"
                                                value={selectedSchedule?.vehicleModel || ""}
                                                onChange={(e) => setSelectedSchedule({
                                                    ...selectedSchedule,
                                                    vehicleModel: e.target.value
                                                })}
                                                disabled={modalMode === "view"}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả</label>
                                        <textarea
                                            rows="3"
                                            value={selectedSchedule?.description || ""}
                                            onChange={(e) => setSelectedSchedule({
                                                ...selectedSchedule,
                                                description: e.target.value
                                            })}
                                            disabled={modalMode === "view"}
                                        />
                                    </div>
                                </div>

                                {/* Plans List */}
                                {modalMode !== "add" && (
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h3>Các mốc bảo dưỡng</h3>
                                            {modalMode !== "view" && (
                                                <button className="btn-secondary" onClick={handleAddPlan}>
                                                    <FaPlus /> Thêm mốc
                                                </button>
                                            )}
                                        </div>

                                        <div className="plans-list">
                                            {plans.length === 0 ? (
                                                <p className="empty-state">Chưa có mốc bảo dưỡng nào.</p>
                                            ) : (
                                                plans.map((plan, index) => (
                                                    <div key={plan.id} className="plan-card">
                                                        <div className="plan-header">
                                                            <span className="plan-number">
                                                                Mốc #{plan.maintenanceNo || index + 1}
                                                            </span>
                                                            {modalMode !== "view" && (
                                                                <button
                                                                    className="btn-icon btn-delete"
                                                                    onClick={() => handleDeletePlan(plan.id, plan.isNew)}
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="form-grid">
                                                            <div className="form-group">
                                                                <label>Số thứ tự *</label>
                                                                <input
                                                                    type="number"
                                                                    value={plan.maintenanceNo === '' ? '' : (plan.maintenanceNo ?? 0)}
                                                                    onChange={(e) => handlePlanChange(plan.id, 'maintenanceNo', e.target.value)}
                                                                    disabled={modalMode === "view"}
                                                                    min="1"
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Tên mốc *</label>
                                                                <input
                                                                    type="text"
                                                                    value={plan.name ?? ''}
                                                                    onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                                                                    disabled={modalMode === "view"}
                                                                    placeholder="VD: Bảo dưỡng cấp 1"
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Quãng đường (km) *</label>
                                                                <input
                                                                    type="number"
                                                                    value={plan.intervalKm === '' ? '' : (plan.intervalKm ?? 0)}
                                                                    onChange={(e) => handlePlanChange(plan.id, 'intervalKm', e.target.value)}
                                                                    disabled={modalMode === "view"}
                                                                    min="0"
                                                                    placeholder="VD: 12000"
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Thời gian (tháng) *</label>
                                                                <input
                                                                    type="number"
                                                                    value={plan.intervalMonth === '' ? '' : (plan.intervalMonth ?? 0)}
                                                                    onChange={(e) => handlePlanChange(plan.id, 'intervalMonth', e.target.value)}
                                                                    disabled={modalMode === "view"}
                                                                    min="0"
                                                                    placeholder="VD: 12"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Mô tả chi tiết</label>
                                                            <textarea
                                                                rows="3"
                                                                value={plan.description ?? ''}
                                                                onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                                                                disabled={modalMode === "view"}
                                                                placeholder="VD: Kiểm tra cơ bản, thay lọc gió điều hòa..."
                                                            />
                                                        </div>

                                                        {modalMode === "view" && (
                                                            <div className="plan-summary">
                                                                <div className="summary-item">
                                                                    <span className="summary-label">Chu kỳ:</span>
                                                                    <span className="summary-value">
                                                                        {formatKm(plan.intervalKm)} hoặc {formatMonth(plan.intervalMonth)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Footer modal */}
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Đóng
                                    </button>
                                    {modalMode !== "view" && (
                                        <button className="btn-primary" onClick={handleSaveAll}>
                                            <FaSave /> Lưu thay đổi
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}