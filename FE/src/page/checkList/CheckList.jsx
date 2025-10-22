import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../page/sidebar/sidebar.jsx";
import { FaSpinner, FaFloppyDisk, FaEye, FaCircleCheck, FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import "./CheckList.css";

// Các trạng thái Status đã được định nghĩa trong Backend
const STATUS_OPTIONS = ["TỐT", "HIỆU_CHỈNH", "SỬA_CHỮA", "THAY_THẾ"];


export default function CheckList({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [checklistList, setChecklistList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeConfirmLoading, setCompleteConfirmLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // State để lưu các thay đổi tạm thời của Technician (Status, Note, Part ID)
  const [detailUpdates, setDetailUpdates] = useState({});

  /**
   * HÀM HELPER: Hiển thị toast notification
   */
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  /**
   * HÀM HELPER: Xử lý nhãn trong dropdown Trạng thái KV
   */
  const getCustomStatusLabel = (statusValue, itemName) => {
    // 1. Logic tùy chỉnh: Áp dụng BẢO DƯỠNG cho THAY_THẾ nếu là hạng mục điều hòa
    if (
      statusValue === "THAY_THẾ" &&
      itemName && itemName.toLowerCase() === "bảo dưỡng hệ thống điều hòa".toLowerCase()
    ) {
      return "BẢO DƯỠNG";
    }

    // 2. Loại bỏ dấu gạch dưới cho các trạng thái còn lại
    if (statusValue) {
      return statusValue.replace(/_/g, ' ');
    }
    return statusValue;
  };

  // Backend đang dùng /api/technician/my-checklists/{bookingId}, nên ta dùng bookingId để fetch detail
  const bookingId = searchParams.get('bookingId');
  const token = localStorage.getItem("token");

  // 1. Fetch dữ liệu khi component được load
  useEffect(() => {
    if (bookingId) {
      setViewMode("detail");
      fetchChecklist(bookingId);
    } else {
      setViewMode("list");
      fetchChecklistList();
    }
  }, [bookingId]);


  useEffect(() => {
    if (checklist && checklist.details) {
      const validStatuses = ["TỐT", "HIỆU_CHỈNH", "SỬA_CHỮA", "THAY_THẾ"];

      const initialUpdates = {};
      checklist.details.forEach(detail => {
        const initialPartId = detail.partId || (detail.part ? detail.part.partId : null);

        const originalStatus = detail.status;
        const isStatusValid = validStatuses.includes(originalStatus);

        initialUpdates[detail.id] = {
          status: isStatusValid ? originalStatus : "TỐT",

          note: detail.note || "",
          partId: initialPartId,
          laborCost: detail.laborCost || 0,
        };
      });
      setDetailUpdates(initialUpdates);
    }
  }, [checklist]);

  const fetchChecklistList = async () => {
    setLoading(true);
    try {
      // API này trả về List<MaintenanceChecklistSummaryResponse>
      const apiUrl = `https://103.90.226.216:8443/api/technician/my-checklists`;

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Không thể tải danh sách Checklist: ${res.status}`);

      const data = await res.json();
      setChecklistList(data);

    } catch (error) {
      console.error("Lỗi khi tải danh sách checklist:", error);
      setChecklistList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chi tiết 1 checklist theo bookingId (trả về FULL DTO)
  const fetchChecklist = async (id) => {
    setLoading(true);
    try {
      // API này trả về MaintenanceChecklistResponse (có details)
      const apiUrl = `https://103.90.226.216:8443/api/technician/my-checklists/${id}`;

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Không thể tải chi tiết Checklist: ${res.status}`);

      const data = await res.json();
      setChecklist(data);

    } catch (error) {
      console.error("Lỗi khi tải checklist:", error);
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thay đổi trong form (Select Status, Select Part, Input Note)
  const handleDetailChange = (detailId, field, value) => {
    setDetailUpdates(prev => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        [field]: value,
      }
    }));
  };

  // Kiểm tra xem có thay đổi nào chưa lưu không
  const hasUnsavedChanges = () => {
    if (!checklist || !checklist.details) return false;

    return checklist.details.some(detail => {
      const updates = detailUpdates[detail.id];
      if (!updates) return false;

      const statusChanged = updates.status !== detail.status;
      const noteChanged = updates.note !== (detail.note || "");
      const partChanged = updates.partId !== (detail.partId || (detail.part ? detail.part.partId : null));
      const laborCostChanged = Number(updates.laborCost || 0) !== Number(detail.laborCost || 0);


      return statusChanged || noteChanged || partChanged || laborCostChanged;
    });
  };

  // Hàm gọi API để cập nhật TẤT CẢ các chi tiết đã thay đổi
  const handleSaveAllChanges = async () => {
    if (!checklist || !checklist.details) return;

    // Lọc ra các detail có thay đổi
    const changedDetails = checklist.details.filter(detail => {
      const updates = detailUpdates[detail.id];
      if (!updates) return false;

      const statusChanged = updates.status !== detail.status;
      const noteChanged = updates.note !== (detail.note || "");
      const partChanged = updates.partId !== (detail.partId || (detail.part ? detail.part.partId : null));

      const laborCostChanged = Number(updates.laborCost || 0) !== Number(detail.laborCost || 0);


      // --- CẬP NHẬT DÒNG RETURN CỦA FILTER ---
      return statusChanged || noteChanged || partChanged || laborCostChanged;
    });

    if (changedDetails.length === 0) {
      showToast("Không có thay đổi nào để lưu", "info");
      return;
    }

    // Validation: Kiểm tra THAY_THẾ phải có Part
    for (const detail of changedDetails) {
      const updates = detailUpdates[detail.id];
      if (updates.status === "THAY_THẾ" && !updates.partId) {
        showToast("Vui lòng chọn Part cần thay thế cho tất cả hạng mục có trạng thái 'THAY_THẾ'", "error");
        return;
      }
    }

    setIsUpdating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Cập nhật từng detail
      for (const detail of changedDetails) {
        const updates = detailUpdates[detail.id];
        try {
          const apiUrl = `https://103.90.226.216:8443/api/technician/update-detail/${detail.id}`;

          // --- CẬP NHẬT BODY TRONG FETCH ---
          const res = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              status: updates.status,
              note: updates.note,
              partId: updates.status === "THAY_THẾ" ? updates.partId : null,

              // Chỉ gửi chi phí nếu là SỬA_CHỮA, nếu không gửi 0
              laborCost: updates.status === "SỬA_CHỮA" ? (updates.laborCost || 0) : 0,
            }),
          });
          // --- KẾT THÚC CẬP NHẬT BODY ---

          if (!res.ok) {
            throw new Error(`Cập nhật lỗi cho hạng mục ${detail.itemName}`);
          }
          successCount++;
        } catch (error) {
          console.error(`Lỗi cập nhật detail ${detail.id}:`, error);
          failCount++;
        }
      }

      // Tải lại checklist để thấy chi phí mới từ Backend
      await fetchChecklist(bookingId);

      if (failCount === 0) {
        showToast(`Đã lưu thành công ${successCount} thay đổi`, "success");
      } else {
        showToast(`Lưu thành công ${successCount} thay đổi, ${failCount} thất bại`, "warning");
      }

    } catch (error) {
      console.error("Lỗi cập nhật checklist details:", error);
      showToast(`Cập nhật thất bại: ${error.message}`, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const executeCompleteChecklist = async () => {
    setCompleteConfirmLoading(true); // Bật loading của modal
    setIsUpdating(true); // Bật loading của trang 

    try {
      // API hoàn thành dùng Checklist ID, không phải Booking ID
      const apiUrl = `https://103.90.226.216:8443/api/technician/${checklist.id}/complete`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Hoàn thành lỗi: ${errorDetail}`);
      }

      showToast("Checklist đã được hoàn thành thành công!", "success");
      await fetchChecklist(bookingId);

    } catch (error) {
      console.error("Lỗi hoàn thành checklist:", error);
      showToast(`Hoàn thành thất bại: ${error.message}`, "error");
    } finally {
      setIsUpdating(false); // Tắt loading của trang
      setCompleteConfirmLoading(false); // Tắt loading của modal
      setShowCompleteConfirm(false); // Đóng modal
    }
  };

  // Hàm gọi API để hoàn thành Checklist
  const handleCompleteChecklist = async () => {
    if (isApprovalPending()) {
      showToast("Vui lòng đợi khách hàng phê duyệt hoặc hủy bỏ tất cả các hạng mục...", "error");
      return;
    }

    // 2. Thay vì gọi window.confirm, chỉ cần mở modal
    setShowCompleteConfirm(true);
  };

  // Xem chi tiết checklist
  const handleViewDetail = (bookingId) => {
    // Chuyển sang URL với bookingId để trigger fetchChecklist
    navigate(`/checklist?bookingId=${bookingId}`);
  };

  /**
   * KIỂM TRA LOGIC: Kiểm tra xem có hạng mục nào cần phê duyệt mà chưa được xử lý không.
   */
  const isApprovalPending = () => {
    if (!checklist || !checklist.details) return false;
    return checklist.details.some(detail => {
      const status = detail.approvalStatus?.toUpperCase();
      const isProcessed = status === 'APPROVED' || status === 'DECLINED';
      return !isProcessed;
    });
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="checklist-page">
        <Sidebar user={user} />
        <div className="content">
          <div className="loading-container">
            <FaSpinner className="spinner-icon" /> Đang tải dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  // RENDER DANH SÁCH CHECKLIST (ĐÃ SỬA ĐỂ TƯƠNG THÍCH VỚI SUMMARY DTO)
  if (viewMode === "list") {
    return (
      <div className="checklist-page">
        <Sidebar user={user} />
        <div className="content">
          {/* Toast Notification */}
          {toast.show && (
            <div className={`toast-notification toast-${toast.type}`}>
              <div className="toast-icon">
                {toast.type === "success" && <FaCircleCheck />}
                {toast.type === "error" && <FaXmark />}
                {toast.type === "warning" && <FaTriangleExclamation />}
                {toast.type === "info" && <FaTriangleExclamation />}
              </div>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
                <FaXmark />
              </button>
            </div>
          )}
          {showCompleteConfirm && (
            <div className="modal-overlay">
              <div className="modal-content confirm-modal">
                <div className="confirm-modal-body">
                  <FaTriangleExclamation className="confirm-icon" />
                  <h3>Xác nhận hoàn thành</h3>
                  <p>Bạn có chắc chắn muốn HOÀN THÀNH Checklist này không?</p>
                  <small style={{ color: '#888', marginTop: '10px', display: 'block' }}>
                    Hành động này sẽ trừ tồn kho Part (nếu có) và thay đổi trạng thái Booking.
                  </small>
                </div>
                <div className="form-actions">
                  <button
                    onClick={() => setShowCompleteConfirm(false)}
                    className="btn-cancel" // Giả sử bạn có class cho nút Hủy
                    disabled={completeConfirmLoading}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={executeCompleteChecklist}
                    className="btn-save" // Giả sử bạn có class cho nút Đồng ý
                    disabled={completeConfirmLoading}
                  >
                    {completeConfirmLoading ? <FaSpinner className="spin" /> : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2 className="page-title">Danh sách Checklist của tôi</h2>

          {checklistList.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa có checklist nào được tạo.</p>
              <small>Checklist sẽ được tự động tạo khi bạn bắt đầu một nhiệm vụ.</small>
            </div>
          ) : (
            <div className="checklist-list">
              {/* Lưu ý: Dữ liệu này là SUMMARY DTO, KHÔNG CÓ TRƯỜNG details */}
              {checklistList.map((item) => (
                <div key={item.id} className="checklist-card">
                  <div className="checklist-card-header">
                    <span className={`status-badge ${item.status === 'In Progress' ? 'in-progress' : 'completed'}`}>
                      {item.status}
                    </span>
                    {/* Backend trả về Checklist ID là 'id'. Ta cần Booking ID để gọi API Detail */}
                    <span className="booking-id">Booking ID #{item.bookingId}</span>
                  </div>

                  <div className="checklist-card-body">
                    <p>
                      <strong>Tên khách hàng:</strong> {item.customerName}
                    </p>
                    <p>
                      <strong>Mẫu xe:</strong> {item.vehicleModel}
                    </p>
                    <p><strong>Biển số xe:</strong> {item.vehicleNumberPlate}</p>
                    <p><strong>KM hiện tại:</strong> {item.currentKm} km</p>
                    <p><strong>Chi phí đã duyệt:</strong> {item.totalCostApproved?.toLocaleString('vi-VN')} VND</p>
                    <p><strong>Chi phí ước tính:</strong> {item.estimatedCost?.toLocaleString('vi-VN')} VND</p>
                  </div>

                  <div className="checklist-card-footer">
                    <button
                      className="btn-view-detail"
                      onClick={() => handleViewDetail(item.bookingId)}
                    >
                      <FaEye /> Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER CHI TIẾT CHECKLIST (Giữ nguyên)
  if (!checklist) {
    return (
      <div className="checklist-page">
        <Sidebar user={user} />
        <div className="content">
          <div className="empty-state">
            <h3>Không tìm thấy checklist</h3>
            <p>Checklist với booking ID <strong>#{bookingId}</strong> không tồn tại hoặc bạn không có quyền truy cập.</p>
            <button className="btn-back" onClick={() => navigate('/checklist')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const checklistDetails = checklist.details || [];
  const isCompleted = checklist.status === 'Completed';

  return (
    <div className="checklist-page">
      <Sidebar user={user} />
      <div className="content">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`toast-notification toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && <FaCircleCheck />}
              {toast.type === "error" && <FaXmark />}
              {toast.type === "warning" && <FaTriangleExclamation />}
              {toast.type === "info" && <FaTriangleExclamation />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
              <FaXmark />
            </button>
          </div>
        )}

        <div className="page-header">
          <h2 className="page-title">Checklist nhiệm vụ #{bookingId}</h2>
          <button className="btn-back" onClick={() => navigate('/checklist')}>
            ← Quay lại danh sách
          </button>
        </div>

        {/* THÔNG TIN TỔNG QUAN (ĐÃ SỬA ĐỂ THÊM MODEL VÀ PLAN NAME) */}
        <div className="summary-section">
          <p><strong>Trạng thái:</strong> <span className={`status-badge ${checklist.status === 'In Progress' ? 'in-progress' : 'completed'}`}>{checklist.status}</span></p>
          <p><strong>Biển số xe:</strong> {checklist.vehicleNumberPlate}</p>
          {/* THÊM MODEL */}
          <p><strong>Mẫu xe:</strong> {checklist.vehicleModel || 'Đang cập nhật...'}</p>
          {/* THÊM PLAN NAME */}
          <p><strong>Gói bảo dưỡng:</strong> {checklist.planName || 'Không có gói'}</p>
          <p><strong>KM bảo dưỡng:</strong> {checklist.currentKm} km</p>
          <p><strong>Bắt đầu:</strong> {new Date(checklist.startTime).toLocaleString('vi-VN')}</p>
          <p><strong>Kết thúc:</strong> {new Date(checklist.endTime).toLocaleString('vi-VN')}</p>
          <p><strong>Chi phí ĐÃ DUYỆT:</strong> <span className="cost-approved">{checklist.totalCostApproved?.toLocaleString('vi-VN')} VND</span></p>
          <p><strong>Chi phí ƯỚC TÍNH (tạm thời):</strong> {checklist.estimatedCost?.toLocaleString('vi-VN')} VND</p>
          

          {!isCompleted && checklist.status === 'In Progress' && (
            <button
              className="btn-complete"
              onClick={handleCompleteChecklist}
              disabled={isUpdating || isApprovalPending()}
            >
              {isUpdating ? <FaSpinner className="spin" /> : "Hoàn thành Checklist"}
            </button>
          )}
          {isApprovalPending() && !isCompleted && (
            <small className="text-red-500 mt-2 block">Cần khách hàng phê duyệt các hạng mục thay thế/sửa chữa.</small>
          )}
        </div>

        {/* BẢNG CHI TIẾT */}
        <table className="checklist-table">
          <thead>
            <tr>
              <th>Mục kiểm tra (ActionType)</th>
              <th>Trạng thái KV</th>
              <th>Ghi chú</th>
              <th>Chọn Part</th>
              <th>Phê duyệt KH</th>
              <th>Chi phí nhân công </th>
              <th>Chi phí vật liệu </th>
              <th>Chi phí (VND)</th>
            </tr>
          </thead>
          <tbody>
            {checklistDetails.map(detail => {
              const currentUpdates = detailUpdates[detail.id] || {};
              const currentStatus = currentUpdates.status || detail.status;
              const isReplace = currentStatus === "THAY_THẾ";
              const isApproved = detail.approvalStatus?.toUpperCase() === 'APPROVED';
              const selectedPart = detail.availableParts.find(p => p.partId === currentUpdates.partId);
              let currentLaborCost = 0;
              let currentMaterialCost = 0;


              if (currentStatus === "THAY_THẾ" && selectedPart) {
                currentLaborCost = selectedPart.laborCost;
                currentMaterialCost = selectedPart.materialCost;
              } else if (currentStatus === "SỬA_CHỮA") {
                currentLaborCost = Number(currentUpdates.laborCost || 0);
                currentMaterialCost = 0;
              }
              const totalCost = currentLaborCost + currentMaterialCost;

              const displayActionType = detail.actionType;

              return (
                <tr key={detail.id} className={detail.approvalStatus === 'APPROVED' ? 'row-approved' : ''}>
                  <td>
                    <div className="item-info">
                      <strong>{detail.itemName}</strong>
                      <small>({displayActionType})</small>
                    </div>
                  </td>
                  <td>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleDetailChange(detail.id, 'status', e.target.value)}
                      disabled={isCompleted || isApproved}
                    >

                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {/* Áp dụng logic tùy chỉnh */}
                          {getCustomStatusLabel(opt, detail.itemName)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={currentUpdates.note || ""}
                      onChange={(e) => handleDetailChange(detail.id, 'note', e.target.value)}
                      disabled={isCompleted || isApproved}
                    />
                  </td>
                  <td>
                    {isReplace ? (
                      // Logic "THAY_THẾ" (chọn Part) giữ nguyên
                      <select
                        value={currentUpdates.partId || ""}
                        onChange={(e) => handleDetailChange(detail.id, 'partId', parseInt(e.target.value) || null)}
                        disabled={isCompleted || isApproved || detail.availableParts.length === 0}
                      >
                        <option value="">
                          {detail.availableParts.length > 0
                            ? "Chọn Part"
                            : (detail.planItem?.partType?.name ? `Hết hàng (${detail.planItem.partType.name})` : "Không có Part")
                          }
                        </option>
                        {detail.availableParts.map(part => {
                          const isService = part.partName.toLowerCase().includes("dịch vụ bảo dưỡng điều hòa");
                          return (
                            <option key={part.partId} value={part.partId}>
                              {part.partName}
                              {!isService && ` (${part.quantity})`}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      // SỬA CHỮA, TỐT, HIỆU CHỈNH đều hiển thị N/A ở cột này
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className={`approval-status approval-${detail.approvalStatus?.toLowerCase()}`}>
                      {detail.approvalStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="cost-cell">
                    {(currentStatus === "SỬA_CHỮA") ? (
                      <input
                        type="number"
                        className="cost-input"
                        value={currentUpdates.laborCost || 0}
                        onChange={(e) => handleDetailChange(detail.id, 'laborCost', e.target.valueAsNumber || 0)}
                        disabled={isCompleted || isApproved}
                        placeholder="Nhập chi phí"

                        style={{ width: '120px', textAlign: 'right', fontSize: '14px' }}
                      />
                    ) : (
                      currentLaborCost.toLocaleString('vi-VN')
                    )}
                  </td>
                  {/* CỘT 7: CHI PHÍ VẬT LIỆU */}
                  <td className="cost-cell">
                    {currentMaterialCost.toLocaleString('vi-VN')}
                  </td>
                  <td className="cost-cell">
                    {totalCost.toLocaleString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* NÚT LƯU THAY ĐỔI - Hiển thị ở cuối bảng */}
        {!isCompleted && checklist.status === 'In Progress' && (
          <div className="save-changes-section">
            <button
              className="btn-save-all-changes"
              onClick={handleSaveAllChanges}
              disabled={isUpdating || !hasUnsavedChanges()}
            >
              {isUpdating ? (
                <>
                  <FaSpinner className="spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <FaFloppyDisk /> Lưu tất cả thay đổi
                </>
              )}
            </button>
            {hasUnsavedChanges() && (
              <small className="unsaved-warning">Bạn có thay đổi chưa được lưu</small>
            )}
          </div>
        )}
      </div>
    </div>
  );
}