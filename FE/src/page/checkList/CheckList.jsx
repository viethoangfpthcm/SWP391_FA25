import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar"; // Đảm bảo đường dẫn đúng
// *** THÊM CÁC ICON CẦN THIẾT ***
import { FaSpinner, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import { Send, CheckCircle } from "lucide-react"; // Giữ lại icon cũ nếu muốn
import "./CheckList.css"; // Sử dụng CSS của CheckList
// *** THÊM useParams và useLocation ***
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function CheckList() {
  // *** LẤY bookingId TỪ URL ***
  const { bookingId } = useParams(); // Lấy bookingId từ route param ":bookingId" (có thể undefined nếu vào /checklist)
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false); // State cho việc cập nhật (Technician)
  const [showDetails, setShowDetails] = useState(true); // Mặc định hiển thị chi tiết

  // *** XÁC ĐỊNH VAI TRÒ DỰA TRÊN URL ***
  const isStaffViewing = location.pathname.startsWith('/staff/checklist/');
  const role = isStaffViewing ? 'STAFF' : 'TECHNICIAN'; // Vai trò hiện tại

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";
  const token = localStorage.getItem("token");

  // Options cho trạng thái hạng mục (giống nhau cho cả 2)
  const statusOptions = [
    { value: "TỐT", label: "Tốt" },
    { value: "HIỆU_CHỈNH", label: "Hiệu chỉnh" },
    { value: "SỬA_CHỮA", label: "Sửa chữa" },
    { value: "THAY_THẾ", label: "Thay thế" },
  ];

  // --- HÀM FETCH CHECKLIST ĐÃ SỬA ---
  const fetchChecklist = async () => {
    setLoading(true);
    setError("");
    setChecklist(null); // Reset checklist cũ

    // Xác định API endpoint và logic dựa trên vai trò và bookingId
    let apiUrl = "";
    let isFetchingById = false;

    if (isStaffViewing) {
      if (!bookingId || isNaN(parseInt(bookingId))) {
        setError("ID Booking không hợp lệ trên URL.");
        setLoading(false);
        return;
      }
      apiUrl = `${API_BASE}/api/staff/checklist/${bookingId}`;
      isFetchingById = true;
    } else { // Là Technician
        if (bookingId && !isNaN(parseInt(bookingId))) {
            // Nếu Technician truy cập với bookingId cụ thể (ví dụ từ link nào đó)
             // Giả sử có API /api/technician/checklist/{bookingId}
            apiUrl = `${API_BASE}/api/technician/checklist/${bookingId}`; // <<<< THAY ĐỔI API NẾU CẦN
             isFetchingById = true;
             console.warn("Technician is fetching by bookingId. Ensure API exists:", apiUrl);
        } else {
            // Technician truy cập /checklist (lấy checklist đang làm)
            apiUrl = `${API_BASE}/api/technician/my-checklists`;
             isFetchingById = false; // Lấy danh sách
        }
    }

    try {
      if (!token) throw new Error("Vui lòng đăng nhập lại.");

      console.log(`🔄 (${role}) Fetching checklist from:`, apiUrl);

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`(${role}) Checklist fetch failed:`, res.status, errorText);
        if (res.status === 401) { setError("Phiên đăng nhập hết hạn."); setTimeout(() => navigate("/"), 1500); }
        else if (res.status === 404) { setError(`Không tìm thấy checklist ${isFetchingById ? `cho booking #${bookingId}` : 'nào đang thực hiện'}.`); }
        else if (res.status === 403) { setError("Bạn không có quyền xem checklist này."); }
        else { setError(`Lỗi ${res.status}: ${errorText}`); }
        return; // Dừng lại
      }

      const data = await res.json();
      console.log(`✅ (${role}) Checklist data received:`, JSON.stringify(data, null, 2));

      // Xử lý dữ liệu trả về
      let checklistData = null;
      if (isFetchingById && data && typeof data === 'object' && !Array.isArray(data)) {
         // Nếu fetch theo ID (Staff hoặc Tech), mong đợi 1 object
         checklistData = data;
      } else if (!isFetchingById && Array.isArray(data)) {
         // Nếu Technician fetch list (/my-checklists)
         if (data.length === 0) {
             setError("Bạn không có checklist nào đang thực hiện.");
         } else {
             // Ưu tiên checklist 'In Progress', nếu không có thì lấy cái mới nhất (hoặc đầu tiên)
             checklistData = data.find(c => c.status?.toLowerCase() === 'in progress') || data[0];
             console.log(`Technician: Found ${data.length} checklists, selected ID: ${checklistData?.id}`);
         }
      } else {
         // Trường hợp dữ liệu trả về không đúng định dạng mong đợi
         console.warn("API response format unexpected:", data);
         setError("Dữ liệu checklist nhận được không hợp lệ.");
      }

      if (checklistData) {
         setChecklist(checklistData);
      }
      // Không cần else vì lỗi đã được set ở trên nếu data không hợp lệ

    } catch (err) {
      console.error(`❌ (${role}) Lỗi khi tải checklist:`, err);
      setError(err.message || "Lỗi kết nối hoặc xử lý dữ liệu checklist.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchChecklist khi component mount hoặc bookingId/role thay đổi
  useEffect(() => {
    fetchChecklist();
  }, [bookingId, isStaffViewing, navigate]); // Thêm isStaffViewing

  // --- CÁC HÀM XỬ LÝ (Vô hiệu hóa cho Staff) ---
  const handleUpdate = async (detailId, field, value) => {
     if (isStaffViewing) {
        // Không làm gì cả hoặc chỉ log
        console.log("Staff view: Update prevented.");
        return;
     }
     // Logic cập nhật của Technician
      setChecklist((prev) => ({
          ...prev,
          details: prev.details.map((item) =>
              item.id === detailId ? { ...item, [field]: value } : item
          ),
      }));

      setUpdating(true); // Báo hiệu đang lưu
      try {
        const item = checklist.details.find((d) => d.id === detailId);
        // Lấy giá trị mới nhất từ state (phòng trường hợp update nhiều field liên tiếp)
        const currentDetailState = checklist.details.find((d) => d.id === detailId);
        const status = field === "status" ? value : currentDetailState?.status || "";
        const note = field === "note" ? value : currentDetailState?.note || "";
        const partId = field === "partId" ? value : currentDetailState?.partId || null;

        const queryParams = new URLSearchParams({ status, note });
         // Chỉ thêm partId nếu nó có giá trị (không phải null, undefined, 0, '')
        if (partId) queryParams.set('partId', partId);

        const url = `${API_BASE}/api/technician/detail/${detailId}?${queryParams.toString()}`;
        console.log("⬆️ Updating detail:", url);

        const res = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `Cập nhật thất bại (${res.status})`);
        }
        // Fetch lại toàn bộ checklist để đảm bảo dữ liệu (đặc biệt là giá) được cập nhật
        await fetchChecklist();
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật chi tiết:", err);
        setError(`Lỗi cập nhật hạng mục #${detailId}: ${err.message}`);
        // Cân nhắc fetch lại checklist để rollback UI nếu API lỗi
        // await fetchChecklist();
      } finally {
        setUpdating(false); // Kết thúc trạng thái lưu
      }
  };

  const handleSendToCustomer = () => {
     if (isStaffViewing) return; // Staff không có quyền
    alert("📨 Gửi checklist cho Customer!");
    // Logic gọi API gửi (nếu có)
  };

  const handleCompleteChecklist = async () => {
    if (isStaffViewing || !checklist || !checklist.id) return; // Staff không có quyền hoặc thiếu ID

     // Thêm xác nhận trước khi hoàn thành
     if (!window.confirm("Bạn chắc chắn muốn hoàn thành checklist này? Hành động này sẽ cập nhật kho phụ tùng và không thể hoàn tác trực tiếp.")) {
       return;
     }

     setUpdating(true); // Dùng updating để báo hiệu đang xử lý
     setError(null);
     try {
       const url = `${API_BASE}/api/technician/${checklist.id}/complete`;
       console.log("🏁 Completing checklist:", url);
       const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
       if (!res.ok) {
           const errorText = await res.text();
           throw new Error(errorText || `Không thể hoàn thành (${res.status})`);
       }
       alert("✅ Checklist đã được đánh dấu là hoàn thành!");
       await fetchChecklist(); // Cập nhật trạng thái trên UI
       // Cân nhắc chuyển hướng Technician về trang task list sau khi hoàn thành
       // navigate("/technician-task");
     } catch (err) {
       console.error("❌ Lỗi khi hoàn thành checklist:", err);
       setError(`Lỗi hoàn thành: ${err.message}`);
     } finally {
        setUpdating(false);
     }
  };

  // --- RENDER ---
  if (loading) {
     return (
        <div className="page-container">
          <Sidebar sidebarOpen={true} />
          <main className="content loading-state">
             <FaSpinner className="spinner" />
             <p>Đang tải chi tiết checklist...</p>
          </main>
        </div>
     );
   }

  // Hiển thị lỗi hoặc không có dữ liệu
  if (error || !checklist) {
     return (
        <div className="page-container">
          <Sidebar sidebarOpen={true} />
           <main className="content error-state">
                <FaExclamationTriangle size={30} style={{ marginBottom: '15px', color: '#dc2626' }} />
                <p style={{ fontWeight: 'bold', color: '#b91c1c' }}>{error || "Không có dữ liệu checklist để hiển thị."}</p>
                <button onClick={() => navigate(-1)} className="back-button" style={{ marginTop: '20px' }}>
                    <FaArrowLeft style={{ marginRight: '5px' }} /> Quay lại
                </button>
           </main>
        </div>
     );
  }

  // Tính toán tổng chi phí (an toàn hơn với optional chaining và kiểm tra mảng)
  const detailsAvailable = checklist.details && Array.isArray(checklist.details);
  const totalLaborCost = detailsAvailable ? checklist.details.reduce((sum, d) => sum + (Number(d.laborCost) || 0), 0) : 0;
  const totalMaterialCost = detailsAvailable ? checklist.details.reduce((sum, d) => sum + (Number(d.materialCost) || 0), 0) : 0;
  const isChecklistCompleted = checklist.status?.toLowerCase() === 'completed'; // Kiểm tra checklist đã hoàn thành chưa

  return (
    <div className="page-container">
      {/* Sidebar có thể cần nhận prop `role` để hiển thị đúng menu */}
      <Sidebar sidebarOpen={true} />
      <main className="content">
        {/* Header */}
        <div className="header-bar">
          <div>
            <h2>{isStaffViewing ? `🔍 Chi tiết Checklist - Booking #${checklist.bookingId || bookingId}` : `🧰 Bảng kiểm tra bảo dưỡng`}</h2>
          </div>
          {/* Chỉ hiển thị nút cho Technician VÀ checklist chưa hoàn thành */}
          {!isStaffViewing && !isChecklistCompleted && (
              <div className="btn-group">
                {/* <button className="btn-primary" onClick={handleSendToCustomer} disabled={updating}>
                  <Send size={16} /> Gửi Customer
                </button> */}
                <button className="btn-success" onClick={handleCompleteChecklist} disabled={updating}>
                  <CheckCircle size={16} /> Hoàn thành
                </button>
              </div>
          )}
           {/* Nút quay lại cho Staff */}
           {isStaffViewing && (
                 <button onClick={() => navigate(-1)} className="back-button-header">
                     <FaArrowLeft style={{ marginRight: '5px' }} /> Quay lại DS
                 </button>
           )}
           {/* Thông báo đã hoàn thành cho Technician */}
            {!isStaffViewing && isChecklistCompleted && (
                <div className="completion-notice">
                    <CheckCircle size={16} color="#16a34a" /> Đã hoàn thành
                </div>
            )}
        </div>

        {/* Tổng quan */}
        <div className="overview-section">
          <h3>📋 Tổng quan bảo dưỡng</h3>
          <div className="overview-grid">
            {/* Sử dụng optional chaining ?. để tránh lỗi nếu checklist không có các thuộc tính này */}
            <p><strong>Tên lịch trình:</strong> {checklist.planName || checklist.scheduleName || 'N/A'}</p>
            <p><strong>Ngày tạo:</strong> {checklist.createdDate ? new Date(checklist.createdDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
            <p><strong>Trạng thái Checklist:</strong> {checklist.status || 'N/A'}</p>
            <p><strong>Kỹ thuật viên:</strong> {checklist.technicianName || 'N/A'}</p>
            <p><strong>Xe:</strong> {checklist.vehicleModel || 'N/A'} ({checklist.vehicleNumberPlate || 'N/A'})</p>
            <p><strong>Km hiện tại (thực tế):</strong> {checklist.currentKm?.toLocaleString() || checklist.actualKm?.toLocaleString() || 'N/A'} km</p>
            <p><strong>Km bảo dưỡng (dự kiến):</strong> {checklist.maintenanceKm?.toLocaleString() || 'N/A'} km</p>
            {/* Hiển thị chi phí */}
            <p><strong>Chi phí ước tính:</strong> {(checklist.estimatedCost ?? 0).toLocaleString()}₫</p>
            <p><strong>Chi phí đã duyệt (KH):</strong> {(checklist.totalCostApproved ?? 0).toLocaleString()}₫</p>
            <p><strong>Chi phí bị từ chối (KH):</strong> {(checklist.totalCostDeclined ?? 0).toLocaleString()}₫</p>
          </div>
        </div>

        {/* Bảng chi tiết */}
        {detailsAvailable ? ( // Chỉ render bảng nếu có details
          <>
            <h3>📊 Chi tiết hạng mục</h3>
            <div className="table-wrapper" style={{ marginTop: '15px' }}> {/* Bọc table vào wrapper */}
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Hạng mục</th>
                      <th>Trạng thái KTV</th>
                      <th>Phụ tùng (nếu thay)</th>
                      <th>Chi phí công</th>
                      <th>Chi phí vật tư</th>
                      <th>Ghi chú KTV</th>
                      <th>Duyệt (KH)</th> {/* Sửa lại label */}
                      <th>Ghi chú KH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.details.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{item.itemName || 'N/A'}</td>
                        {/* Trạng thái KTV */}
                        <td>
                            {isStaffViewing || isChecklistCompleted ? ( // Staff hoặc checklist đã hoàn thành => chỉ xem
                                <span className={`status-text status-text-${item.status?.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                                    {statusOptions.find(opt => opt.value === item.status)?.label || item.status || 'N/A'}
                                </span>
                            ) : ( // Technician và chưa hoàn thành => select
                                <select value={item.status || ""} onChange={(e) => handleUpdate(item.id, "status", e.target.value)} disabled={updating} >
                                    <option value="" disabled>-- Chọn --</option>
                                    {statusOptions.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                </select>
                            )}
                        </td>
                        {/* Phụ tùng */}
                        <td>
                          {isStaffViewing || isChecklistCompleted ? (
                               <span className="part-name">{item.partName || (item.status === "THAY THẾ" ? 'Chưa chọn' : '—')}</span>
                          ) : (
                              item.status === "THAY THẾ" ? (
                                  <select value={item.partId || ""} onChange={(e) => handleUpdate(item.id, "partId", e.target.value)} disabled={updating} >
                                    <option value="">-- Chọn phụ tùng --</option>
                                    {/* Sử dụng Set để loại bỏ part trùng lặp nếu API trả về lỗi */}
                                    { item.availableParts && [...new Map(item.availableParts.map(p => [p.partId, p])).values()]
                                        .filter(p => p.quantity > 0 || String(p.partId) === String(item.partId)) // Hiện part đã chọn kể cả hết hàng
                                        .map((p) => (
                                            <option key={p.partId} value={p.partId}>
                                                {p.partName} ({String(p.partId) === String(item.partId) ? 'Đã chọn' : `${p.quantity} có sẵn`})
                                            </option>
                                        ))
                                    }
                                  </select>
                              ) : ( "—" )
                          )}
                        </td>
                        {/* Chi phí */}
                        <td>{item.laborCost ? `${Number(item.laborCost).toLocaleString()}₫` : "0₫"}</td>
                        <td>{item.materialCost ? `${Number(item.materialCost).toLocaleString()}₫` : "0₫"}</td>
                        {/* Ghi chú KTV */}
                        <td>
                             {isStaffViewing || isChecklistCompleted ? (
                                  <span className="note-text">{item.note || 'Không có'}</span>
                             ) : (
                                <input type="text" value={item.note || ""} placeholder="Ghi chú..." onChange={(e) => handleUpdate(item.id, "note", e.target.value)} disabled={updating} />
                             )}
                        </td>
                         {/* Trạng thái duyệt KH */}
                         <td>
                            <span className={`approval-status approval-${(item.approvalStatus || 'pending').toLowerCase()}`}>
                                { item.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                                  item.approvalStatus === 'DECLINED' ? 'Từ chối' : 'Chờ duyệt' }
                            </span>
                         </td>
                         {/* Ghi chú KH */}
                         <td>
                            <span className="note-text">{item.customerNote || 'Không có'}</span>
                         </td>
                      </tr>
                    ))}
                    {/* Dòng tổng cộng */}
                    <tr className="total-row">
                      <td colSpan="4" style={{ textAlign: "right" }}><strong>Tổng cộng ước tính:</strong></td>
                      <td><strong>{totalLaborCost.toLocaleString()}₫</strong></td>
                      <td><strong>{totalMaterialCost.toLocaleString()}₫</strong></td>
                      <td colSpan="3"></td> {/* Điều chỉnh colspan */}
                    </tr>
                  </tbody>
                </table>
            </div>
          </>
        ) : (
             <p className="no-detail-message">Không có chi tiết hạng mục nào trong checklist này.</p>
         )}

        {/* Thông báo đang lưu (chỉ cho Tech) */}
        {updating && !isStaffViewing && <p className="saving-indicator"><FaSpinner className="spinner-icon" /> Đang lưu thay đổi...</p>}
      </main>
    </div>
  );
}