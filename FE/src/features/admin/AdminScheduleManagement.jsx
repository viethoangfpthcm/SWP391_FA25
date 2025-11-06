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
import { API_BASE_URL } from "@config/api.js";

export default function AdminScheduleManagement() {
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("view");
    const [userInfo, setUserInfo] = useState(null);
    const [filterVehicle, setFilterVehicle] = useState("all");

    // Modal quản lý items
    const [itemsModal, setItemsModal] = useState({
        open: false,
        plan: null,
        items: [],
        loading: false
    });

    // Danh sách part types
    const [partTypes, setPartTypes] = useState([]);

    const navigate = useNavigate();
    

    const getToken = () => localStorage.getItem("token");

    // --- Lấy thông tin user ---
    const fetchUserInfo = async () => {
        try {
            const res = await fetch(API_BASE_URL + "/api/users/account/current", {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });
            if (res.status === 401) { localStorage.clear(); navigate("/"); return; }
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

    // Fetch schedules
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_BASE_URL + "/api/admin/schedules", {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });
            if (res.status === 401) { localStorage.clear(); navigate("/"); return; }
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

    // Fetch plans
    const fetchPlans = async (scheduleId) => {
        try {
            setLoading(true);
            const res = await fetch(API_BASE_URL + "/api/admin/schedules/" + scheduleId + "/plans", {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
            });
            if (!res.ok) throw new Error("Không thể tải danh sách mốc bảo dưỡng");
            const data = await res.json();
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

    // LẤY PART TYPES TỪ API
    const fetchPartTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/part-types`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error("Không thể tải loại linh kiện");
            const data = await res.json();
            setPartTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi tải part types:", err);
            setPartTypes([]);
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate("/"); return; }
        fetchUserInfo();
        fetchSchedules();
    }, [navigate]);

    // Modal handlers
    const handleViewSchedule = (schedule) => {
        setSelectedSchedule({ ...schedule, name: schedule.name || "", description: schedule.description || "", vehicleModel: schedule.vehicleModel || "" });
        fetchPlans(schedule.id);
        setModalMode("view");
        setShowModal(true);
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSchedule({ ...schedule, name: schedule.name || "", description: schedule.description || "", vehicleModel: schedule.vehicleModel || "" });
        fetchPlans(schedule.id);
        setModalMode("edit");
        setShowModal(true);
    };

    const handleAddSchedule = () => {
        setSelectedSchedule({ id: null, name: "", description: "", vehicleModel: "" });
        setPlans([]);
        setModalMode("add");
        setShowModal(true);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch trình này?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Không thể xóa lịch trình");
            alert("Đã xóa lịch trình thành công");
            fetchSchedules();
        } catch (err) {
            alert("Không thể xóa lịch trình");
            console.error(err);
        }
    };

    // Lưu schedule – GIỮ ?query
    const handleSaveSchedule = async () => {
        try {
            const name = selectedSchedule?.name?.trim();
            const vehicleModel = selectedSchedule?.vehicleModel?.trim();
            const description = selectedSchedule?.description?.trim() || "";

            if (!name) throw new Error("Tên lịch trình không được để trống");
            if (!vehicleModel) throw new Error("Dòng xe không được để trống");

            const query = new URLSearchParams({ name, vehicleModel, description }).toString();
            const bodyData = { name, vehicleModel, description };

            let res;
            if (modalMode === "add") {
                // Thử cả 2 cách: query string VÀ body
                res = await fetch(`${API_BASE_URL}/api/admin/schedules?${query}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(bodyData),
                });
            } else if (modalMode === "edit" && selectedSchedule?.id) {
                // Thử cả 2 cách: query string VÀ body
                res = await fetch(`${API_BASE_URL}/api/admin/schedules/${selectedSchedule.id}?${query}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(bodyData),
                });
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Lỗi ${res.status}: ${text}`);
            }

            const data = await res.json();
            setSelectedSchedule(data);
            setSchedules(prev => modalMode === "add" ? [...prev, data] : prev.map(s => s.id === data.id ? data : s));
            return data;
        } catch (error) {
            alert(error.message);
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
                `${API_BASE_URL}/api/admin/plans/${planId}`,
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

    // MỞ MODAL ITEMS + LOAD PART TYPES TRƯỚC
    const handleEditItems = async (plan) => {
        if (!plan?.id) return alert("Không có ID mốc bảo dưỡng!");

        setItemsModal({ open: true, plan, items: [], loading: true });

        try {
            // ĐẢM BẢO PART TYPES LOAD TRƯỚC
            await fetchPartTypes();

            const res = await fetch(`${API_BASE_URL}/api/admin/plans/${plan.id}/items`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (!res.ok) throw new Error(`Lỗi ${res.status}`);

            const data = await res.json();
            const sanitized = Array.isArray(data) ? data.map(item => ({
                id: item.id,
                planId: plan.id,
                itemName: item.itemName || "",
                actionType: item.actionType || "INSPECT",
                part_type_id: item.part_type_id || null,
                note: item.note || "",
                isNew: false
            })) : [];

            setItemsModal({ open: true, plan, items: sanitized, loading: false });
        } catch (err) {
            alert("Lỗi: " + err.message);
            setItemsModal({ open: false, plan: null, items: [], loading: false });
        }
    };

    const addItem = () => {
        const newItem = {
            id: `temp_${Date.now()}`,
            planId: itemsModal.plan.id,
            itemName: "",
            actionType: "INSPECT",
            part_type_id: null, // CHO PHÉP NULL
            note: "",
            isNew: true
        };
        setItemsModal(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const deleteItem = async (itemId, isNew) => {
        if (!window.confirm("Xóa công việc này?")) return;
        if (isNew || itemId.toString().startsWith('temp_')) {
            setItemsModal(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/plan-items/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error("Không thể xóa công việc");
            setItemsModal(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
        } catch (err) {
            alert("Lỗi xóa: " + err.message);
        }
    };

    const updateItem = (itemId, field, value) => {
        setItemsModal(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: value, modified: true } : item
            )
        }));
    };

    // LƯU ITEMS – KHÔNG BẮT BUỘC part_type_id
    const saveAllItems = async () => {
        const token = getToken();
        if (!token) return alert("Phiên hết hạn!");

        try {
            for (const item of itemsModal.items) {
                if (!item.itemName?.trim()) {
                    alert("Tên công việc không được để trống!");
                    return;
                }

                const itemData = {
                    planId: itemsModal.plan.id,
                    itemName: item.itemName.trim(),
                    actionType: item.actionType || "INSPECT",
                    part_type_id: item.part_type_id || null,
                    note: item.note?.trim() || ""
                };

                if (item.isNew || item.id.toString().startsWith('temp_')) {
                    // Thêm item mới
                    const res = await fetch(`${API_BASE_URL}/api/admin/plan-items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(itemData),
                    });

                    if (res.status === 401 || res.status === 403) {
                        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                        localStorage.clear();
                        navigate("/");
                        return;
                    }

                    if (!res.ok) {
                        const error = await res.text();
                        throw new Error(`Không thể thêm công việc: ${error}`);
                    }
                } else if (item.modified) {
                    // Cập nhật item đã tồn tại
                    const res = await fetch(
                        `${API_BASE_URL}/api/admin/plan-items/${item.id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify(itemData),
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
                        throw new Error(`Không thể cập nhật công việc: ${error}`);
                    }
                }
            }

            alert("Đã lưu công việc thành công!");
            setItemsModal({ open: false, plan: null, items: [], loading: false });
            
            // Refresh lại plans để hiển thị items mới
            if (selectedSchedule?.id) {
                await fetchPlans(selectedSchedule.id);
            }
        } catch (err) {
            console.error("Lỗi khi lưu items:", err);
            alert("Lỗi: " + err.message);
        }
    };

    // Lưu plans
    const savePlans = async (scheduleId) => {
        const token = getToken();
        if (!token) return alert("Phiên hết hạn!");

        try {
            for (const plan of plans) {
                // Chuẩn hóa data trước khi gửi
                const planData = {
                    scheduleId: scheduleId,
                    maintenanceNo: parseInt(plan.maintenanceNo) || 0,
                    intervalKm: parseInt(plan.intervalKm) || 0,
                    intervalMonth: parseInt(plan.intervalMonth) || 0,
                    name: plan.name || "",
                    description: plan.description || "",
                };

                if (plan.isNew || plan.id.toString().startsWith('temp_')) {
                    // Thêm plan mới
                    const res = await fetch(`${API_BASE_URL}/api/admin/plans`, {
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
                        `${API_BASE_URL}/api/admin/plans/${plan.id}`,
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

    // Lưu toàn bộ
    const handleSaveAll = async () => {
        try {
            const savedSchedule = await handleSaveSchedule();
            if (!savedSchedule?.id) throw new Error("Không lấy được ID lịch trình");
            if (modalMode !== "add" && plans.some(p => p.modified || p.isNew)) {
                await savePlans(savedSchedule.id);
            }
            alert("Đã lưu thành công!");
            setShowModal(false);
            setSelectedSchedule(null);
            setPlans([]);
            fetchSchedules();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    const handlePlanChange = (planId, field, value) => {
        setPlans(plans.map(p => {
            if (p.id !== planId) return p;
            let val = value;
            if (['maintenanceNo', 'intervalKm', 'intervalMonth'].includes(field)) {
                val = value === '' ? 0 : parseInt(value) || 0;
            }
            return { ...p, [field]: val, modified: true };
        }));
    };

    const formatKm = (km) => !km ? "0 km" : km >= 1000 ? (km / 1000) + "K km" : km + " km";
    const formatMonth = (month) => !month ? "0 tháng" : month + " tháng";

    const filteredSchedules = filterVehicle === "all" ? schedules : schedules.filter(s => s.vehicleModel === filterVehicle);
    const vehicleModels = [...new Set(schedules.map(s => s.vehicleModel))];

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
                    <h1><FaCalendarAlt /> Quản lý Lịch trình Bảo dưỡng</h1>
                    <p>Quản lý lịch trình và mốc bảo dưỡng cho từng dòng xe.</p>
                </header>
                {error && <div className="error-message"><FaExclamationTriangle /> {error}</div>}
                <div className="actions-bar">
                    <div className="filter-group">
                        <label><FaFilter /> Lọc theo dòng xe:</label>
                        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                            <option value="all">Tất cả</option>
                            {vehicleModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <button className="btn-primary" onClick={handleAddSchedule}><FaPlus /> Thêm lịch trình</button>
                </div>
                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Tên lịch trình</th><th>Mô tả</th><th>Dòng xe</th><th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5"><Loading inline /> Đang tải...</td></tr>
                                ) : filteredSchedules.length > 0 ? (
                                    filteredSchedules.map(s => (
                                        <tr key={s.id}>
                                            <td>#{s.id}</td>
                                            <td><strong>{s.name}</strong></td>
                                            <td>{s.description}</td>
                                            <td><span className="role-badge role-confirmed">{s.vehicleModel}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-icon btn-view" onClick={() => handleViewSchedule(s)} title="Xem"><FaEye /></button>
                                                    <button className="btn-icon btn-edit" onClick={() => handleEditSchedule(s)} title="Sửa"><FaEdit /></button>
                                                    <button className="btn-icon btn-delete" onClick={() => handleDeleteSchedule(s.id)} title="Xóa"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="empty-state">Không có lịch trình nào.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal chính */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {modalMode === "view" && "Chi tiết lịch trình"}
                                    {modalMode === "edit" && "Chỉnh sửa lịch trình"}
                                    {modalMode === "add" && "Thêm lịch trình mới"}
                                </h2>
                                <button className="btn-close" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-section">
                                    <h3>Thông tin lịch trình</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Tên lịch trình *</label>
                                            <input type="text" value={selectedSchedule?.name || ""} onChange={e => setSelectedSchedule({ ...selectedSchedule, name: e.target.value })} disabled={modalMode === "view"} />
                                        </div>
                                        <div className="form-group">
                                            <label>Dòng xe *</label>
                                            <input type="text" value={selectedSchedule?.vehicleModel || ""} onChange={e => setSelectedSchedule({ ...selectedSchedule, vehicleModel: e.target.value })} disabled={modalMode === "view"} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả</label>
                                        <textarea rows="3" value={selectedSchedule?.description || ""} onChange={e => setSelectedSchedule({ ...selectedSchedule, description: e.target.value })} disabled={modalMode === "view"} />
                                    </div>
                                </div>
                                {modalMode !== "add" && (
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h3>Các mốc bảo dưỡng</h3>
                                            {modalMode !== "view" && <button className="btn-secondary" onClick={handleAddPlan}><FaPlus /> Thêm mốc</button>}
                                        </div>
                                        <div className="plans-list">
                                            {plans.length === 0 ? (
                                                <p className="empty-state">Chưa có mốc bảo dưỡng nào.</p>
                                            ) : (
                                                plans.map((plan, idx) => (
                                                    <div key={plan.id} className="plan-card">
                                                        <div className="plan-header">
                                                            <span className="plan-number">Mốc #{plan.maintenanceNo || idx + 1}</span>
                                                            {modalMode !== "view" && (
                                                                <div className="plan-actions">
                                                                    <button className="btn-icon btn-edit" onClick={() => handleEditItems(plan)} title="Sửa công việc"><FaEdit /></button>
                                                                    <button className="btn-icon btn-delete" onClick={() => handleDeletePlan(plan.id, plan.isNew)}><FaTrash /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="form-grid">
                                                            <div className="form-group">
                                                                <label>Số thứ tự *</label>
                                                                <input type="number" value={plan.maintenanceNo ?? 0} onChange={e => handlePlanChange(plan.id, 'maintenanceNo', e.target.value)} disabled={modalMode === "view"} min="1" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Tên mốc *</label>
                                                                <input type="text" value={plan.name ?? ''} onChange={e => handlePlanChange(plan.id, 'name', e.target.value)} disabled={modalMode === "view"} placeholder="VD: Bảo dưỡng cấp 1" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Quãng đường (km) *</label>
                                                                <input type="number" value={plan.intervalKm ?? 0} onChange={e => handlePlanChange(plan.id, 'intervalKm', e.target.value)} disabled={modalMode === "view"} min="0" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Thời gian (tháng) *</label>
                                                                <input type="number" value={plan.intervalMonth ?? 0} onChange={e => handlePlanChange(plan.id, 'intervalMonth', e.target.value)} disabled={modalMode === "view"} min="0" />
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Mô tả chi tiết</label>
                                                            <textarea rows="3" value={plan.description ?? ''} onChange={e => handlePlanChange(plan.id, 'description', e.target.value)} disabled={modalMode === "view"} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button className="btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                                    {modalMode !== "view" && <button className="btn-primary" onClick={handleSaveAll}><FaSave /> Lưu thay đổi</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal items - KHÔNG BẮT BUỘC CHỌN part_type */}
                {itemsModal.open && (
                    <div className="modal-overlay" onClick={() => setItemsModal({ ...itemsModal, open: false })}>
                        <div className="modal-content plan-items-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Chỉnh sửa công việc - {itemsModal.plan.name || `Mốc #${itemsModal.plan.maintenanceNo}`}</h2>
                                <button className="btn-close" onClick={() => setItemsModal({ ...itemsModal, open: false })}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex gap-2 mb-3">
                                    <button className="btn-secondary" onClick={addItem}><FaPlus /> Thêm công việc</button>
                                </div>
                                {itemsModal.loading ? (
                                    <div className="text-center"><Loading inline /> Đang tải...</div>
                                ) : itemsModal.items.length === 0 ? (
                                    <p className="empty-state">Chưa có công việc nào. Thêm để bắt đầu!</p>
                                ) : (
                                    <div className="items-list">
                                        {itemsModal.items.map((item, idx) => (
                                            <div key={item.id} className="item-card">
                                                <div className="item-header">
                                                    <span>Công việc #{idx + 1}</span>
                                                    <button className="btn-icon btn-delete2" onClick={() => deleteItem(item.id, item.isNew)}><FaTrash /></button>
                                                </div>
                                                <div className="form-group">
                                                    <label>Tên công việc *</label>
                                                    <input type="text" value={item.itemName || ""} onChange={e => updateItem(item.id, "itemName", e.target.value)} placeholder="VD: Kiểm tra dầu máy" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Loại hành động</label>
                                                    <select value={item.actionType || "INSPECT"} onChange={e => updateItem(item.id, "actionType", e.target.value)}>
                                                        <option value="INSPECT">Kiểm tra</option>
                                                        <option value="REPLACE">Thay thế</option>
                                                        <option value="CLEAN">Vệ sinh</option>
                                                        <option value="ADJUST">Điều chỉnh</option>
                                                        <option value="REPAIR">Sửa chữa</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Loại linh kiện</label>
                                                    <select
                                                        value={item.part_type_id || ""}
                                                        onChange={e => updateItem(item.id, "part_type_id", e.target.value ? Number(e.target.value) : null)}
                                                    >
                                                        <option value="">-- Chọn loại linh kiện --</option>
                                                        {partTypes.map(pt => (
                                                            <option key={pt.id} value={pt.id}>
                                                                {pt.name || pt.type_name || `ID: ${pt.id}`}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* HIỂN THỊ TÊN CŨ NẾU CHƯA LOAD */}
                                                    {item.part_type_id && !partTypes.find(pt => pt.id === item.part_type_id) && (
                                                        <small className="text-muted d-block mt-1">
                                                            Đã chọn: ID {item.part_type_id} (đang tải tên...)
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label>Ghi chú</label>
                                                        <textarea value={item.note || ""} onChange={e => updateItem(item.id, "note", e.target.value)} placeholder="Chi tiết..." />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setItemsModal({ ...itemsModal, open: false })}>Hủy</button>
                                <button className="btn-primary" onClick={saveAllItems}><FaSave /> Lưu công việc</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}