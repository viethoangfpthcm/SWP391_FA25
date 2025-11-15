import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@config/api.js";
import Sidebar from "@components/layout/Sidebar.jsx";
import { FaSpinner, FaFloppyDisk, FaEye, FaCircleCheck, FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import "./CheckList.css";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import { useMinimumDelay } from "@/hooks/useMinimumDelay.js";

// Các trạng thái Status đã được định nghĩa trong Backend
const STATUS_OPTIONS = ["GOOD", "ADJUSTMENT", "REPAIR", "REPLACE"];
const formatChecklistStatus = (status) => {
  switch (status) {
    case 'IN_PROGRESS': return 'Đang xử lý';
    case 'PENDING_APPROVAL': return 'Chờ duyệt cuối';
    case 'COMPLETED': return 'Đã hoàn thành';
    default: return status;
  }
};
const formatApprovalStatus = (status) => {
  switch (status) {
    case 'APPROVED': return '✓ Đã duyệt';
    case 'DECLINED': return '✗ Từ chối';
    case 'PENDING': return 'Chờ duyệt';
    default: return 'Chờ duyệt';
  }
};

export default function CheckList({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [checklistList, setChecklistList] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumDelay(loading, 1000);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeConfirmLoading, setCompleteConfirmLoading] = useState(false);

  const hasDeclinedItems = () => {
    if (!checklist || !checklist.details) return false;
    return checklist.details.some(detail =>
      detail.approvalStatus?.toUpperCase() === 'DECLINED'
    );
  };
  const hasPendingApprovalItems = () => {
    if (!checklist || !checklist.details) return false;
    return checklist.details.some(detail =>
      detail.approvalStatus?.toUpperCase() === 'PENDING'
    );
  };
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
    // 1. Logic tùy chỉnh: Áp dụng BẢO DƯỠNG cho REPLACE nếu là hạng mục điều hòa
    if (
      statusValue === "REPLACE" &&
      itemName && itemName.toLowerCase() === "bảo dưỡng hệ thống điều hòa".toLowerCase()
    ) {
      return "BẢO DƯỠNG";
    }

    switch (statusValue) {
      case 'GOOD': return 'Tốt';
      case 'ADJUSTMENT': return 'Hiệu chỉnh';
      case 'REPAIR': return 'Sửa chữa';
      case 'REPLACE': return 'Thay thế';
      case 'PENDING': return 'Chờ kiểm tra';
      default: return statusValue;
    }
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
      const validStatuses = ["PENDING", "GOOD", "ADJUSTMENT", "REPAIR", "REPLACE"];

      const initialUpdates = {};
      checklist.details.forEach(detail => {
        const initialPartId = detail.partId || (detail.part ? detail.part.partId : null);

        let originalStatus = detail.status;
        const isStatusValid = validStatuses.includes(originalStatus);

        if (originalStatus === "PENDING") {
          originalStatus = "GOOD";
        }

        initialUpdates[detail.id] = {
          status: isStatusValid ? originalStatus : "GOOD",
          note: detail.note || "",
          partId: initialPartId,
          laborCost: detail.laborCost || 0,
          materialCost: detail.materialCost || 0,
        };
      });
      setDetailUpdates(initialUpdates);
    }
  }, [checklist]);

  const fetchChecklistList = async () => {
    setLoading(true);
    try {
      // API này trả về List<MaintenanceChecklistSummaryResponse>
      const apiUrl = `${API_BASE_URL}/api/technician/my-checklists`;

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
      const apiUrl = `${API_BASE_URL}/api/technician/my-checklists/${id}`;

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
      const materialCostChanged = Number(updates.materialCost || 0) !== Number(detail.materialCost || 0);

      return statusChanged || noteChanged || partChanged || laborCostChanged || materialCostChanged;
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
      const materialCostChanged = Number(updates.materialCost || 0) !== Number(detail.materialCost || 0);
      return statusChanged || noteChanged || partChanged || laborCostChanged || materialCostChanged;
    });

    if (changedDetails.length === 0) {
      showToast("Không có thay đổi nào để lưu", "info");
      return;
    }

    // Validation: Kiểm tra REPLACE phải có Part
    for (const detail of changedDetails) {
      const updates = detailUpdates[detail.id];
      if (updates.status === "REPLACE" && !updates.partId) {
        showToast("Vui lòng chọn Part cần thay thế cho tất cả hạng mục có trạng thái 'Thay thế'", "error");
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
          const apiUrl = `${API_BASE_URL}/api/technician/update-detail/${detail.id}`;

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
              partId: updates.status === "REPLACE" ? updates.partId : null,

              // Chỉ gửi chi phí nếu là REPAIR, nếu không gửi 0
              laborCost: updates.status === "REPAIR" ? (updates.laborCost || 0) : 0,
              materialCost: updates.status === "REPAIR" ? (updates.materialCost || 0) : 0,
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
      const apiUrl = `${API_BASE_URL}/api/technician/${checklist.id}/complete`;

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
    setShowCompleteConfirm(true);
  };

  // Xem chi tiết checklist
  const handleViewDetail = (bookingId) => {
    // Chuyển sang URL với bookingId để trigger fetchChecklist
    navigate(`/checklist?bookingId=${bookingId}`);
  };

  // --- Render Logic ---
  if (showLoading) {
  return (
    <Loading text="Đang tải báo cáo kỹ thuật..." />
  );
}
 

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
              <Button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
                <FaXmark />
              </Button>
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
                  <Button
                    onClick={() => setShowCompleteConfirm(false)}
                    className="btn-cancel" // Giả sử bạn có class cho nút Hủy
                    disabled={completeConfirmLoading}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    onClick={executeCompleteChecklist}
                    className="btn-save" // Giả sử bạn có class cho nút Đồng ý
                    disabled={completeConfirmLoading}
                  >
                    {completeConfirmLoading ? <Loading inline /> : 'Xác nhận'}
                  </Button>
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
              {checklistList.map((item) => (
                <div key={item.id} className="checklist-card">
                  <div className="checklist-card-header">
                    <span className={`status-badge ${item.status === 'IN_PROGRESS' ? 'in-progress' : 'COMPLETED'}`}>
                      {formatChecklistStatus(item.status)}
                    </span>
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
                    <Button
                      className="btn-view-detail"
                      onClick={() => handleViewDetail(item.bookingId)}
                    >
                      <FaEye /> Xem chi tiết
                    </Button>
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
            <Button className="btn-back" onClick={() => navigate('/checklist')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const checklistDetails = checklist.details || [];
  const isCompleted = checklist.status === 'COMPLETED';

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
            <Button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}>
              <FaXmark />
            </Button>
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
                <Button
                  onClick={() => setShowCompleteConfirm(false)}
                  className="btn-cancel"
                  disabled={completeConfirmLoading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={executeCompleteChecklist}
                  className="btn-save"
                  disabled={completeConfirmLoading}
                >
                  {completeConfirmLoading ? <Loading inline /> : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="page-header">
          <h2 className="page-title">Checklist nhiệm vụ #{bookingId}</h2>
          <Button className="btn-back" onClick={() => navigate('/checklist')}>
            ← Quay lại danh sách
          </Button>
        </div>

        {/* THÔNG TIN TỔNG QUAN (ĐÃ SỬA ĐỂ THÊM MODEL VÀ PLAN NAME) */}
        <div className="summary-section">
          <p><strong>Trạng thái:</strong> <span className={`status-badge ${checklist.status === 'IN_PROGRESS' ? 'in-progress' : 'COMPLETED'}`}> {formatChecklistStatus(checklist.status)}</span></p>
          <p><strong>Biển số xe:</strong> {checklist.vehicleNumberPlate}</p>
          <p><strong>Mẫu xe:</strong> {checklist.vehicleModel || 'Đang cập nhật...'}</p>
          <p><strong>Gói bảo dưỡng:</strong> {checklist.planName || 'Không có gói'}</p>
          <p><strong>KM bảo dưỡng:</strong> {checklist.currentKm} km</p>
          <p><strong>Bắt đầu:</strong> {new Date(checklist.startTime).toLocaleString('vi-VN')}</p>
          <p><strong>Kết thúc:</strong> {new Date(checklist.endTime).toLocaleString('vi-VN')}</p>
          <p><strong>Chi phí ĐÃ DUYỆT:</strong> <span className="cost-approved">{checklist.totalCostApproved?.toLocaleString('vi-VN')} VND</span></p>
          <p><strong>Chi phí ƯỚC TÍNH (tạm thời):</strong> {checklist.estimatedCost?.toLocaleString('vi-VN')} VND</p>


          {!isCompleted && checklist.status === 'PENDING_APPROVAL' && (
            <Button
              className="btn-complete"
              onClick={handleCompleteChecklist}
              disabled={isUpdating || hasPendingApprovalItems()}
            >
              {isUpdating ? <Loading inline /> : "Hoàn thành Checklist"}
            </Button>
          )}

          {/* Hiển thị thông báo theo trạng thái */}
          {checklist.status === 'IN_PROGRESS' && !isCompleted && (
            <small className="text-yellow-500 mt-2 block">
              Vui lòng lưu tất cả thay đổi và đợi khách hàng phê duyệt...
            </small>
          )}
          {hasPendingApprovalItems() && !isCompleted && (
            <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontWeight: 'bold' }}>
              Không thể hoàn thành. Vẫn còn hạng mục đang chờ khách hàng phê duyệt.
            </small>
          )}

          {checklist.status === 'PENDING_APPROVAL' && !isCompleted && !hasPendingApprovalItems() && (
            <small className="text-green-500 mt-2 block">
              Khách hàng đã phê duyệt. Bạn có thể hoàn thành checklist!
            </small>
          )}
        </div>

        {/* BẢNG CHI TIẾT */}
        <table className="checklist-table">
          <thead>
            <tr>
              <th>Mục kiểm tra (ActionType)</th>
              <th>Trạng thái KV</th>
              <th>Ghi chú</th>
              <th>Ghi chú KH</th>
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
              const isReplace = currentStatus === "REPLACE";
              const isApproved = detail.approvalStatus?.toUpperCase() === 'APPROVED';
              const selectedPart = detail.availableParts.find(p => p.partId === currentUpdates.partId);
              let currentLaborCost = 0;
              let currentMaterialCost = 0;


              if (currentStatus === "REPLACE" && selectedPart) {
                currentLaborCost = selectedPart.laborCost;
                currentMaterialCost = selectedPart.materialCost;
              } else if (currentStatus === "REPAIR") {
                currentLaborCost = Number(currentUpdates.laborCost || 0);
                currentMaterialCost = Number(currentUpdates.materialCost || 0);
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
                      disabled={isCompleted || detail.approvalStatus?.toUpperCase() === 'APPROVED'}
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
                      disabled={isCompleted || detail.approvalStatus?.toUpperCase() === 'APPROVED'}
                    />
                  </td>
                  <td>
                    <span className="customer-note">
                      {detail.customerNote || "-"}
                    </span>
                  </td>
                  <td>
                    {isReplace ? (
                      // Logic "REPLACE" (chọn Part) giữ nguyên
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
                      {formatApprovalStatus(detail.approvalStatus)}
                    </span>
                  </td>
                  <td className="cost-cell">
                    {(currentStatus === "REPAIR") ? (
                      <input
                        type="number"
                        className="cost-input"
                        value={currentUpdates.laborCost || 0}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber || 0;
                          if (value >= 0) {
                            handleDetailChange(detail.id, 'laborCost', value);
                          }
                        }}
                        min="0"
                        disabled={isCompleted || detail.approvalStatus?.toUpperCase() === 'APPROVED'}
                        placeholder="Nhập chi phí"
                        style={{ width: '120px', textAlign: 'right', fontSize: '14px' }}
                      />
                    ) : (
                      currentLaborCost.toLocaleString('vi-VN')
                    )}
                  </td>
                  {/* CỘT 7: CHI PHÍ VẬT TƯ */}
                  <td className="cost-cell">
                    {(currentStatus === "REPAIR") ? (
                      <input
                        type="number"
                        className="cost-input"
                        value={currentUpdates.materialCost || 0}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber || 0;
                          if (value >= 0) {
                            handleDetailChange(detail.id, 'materialCost', value);
                          }
                        }}
                        min="0"
                        disabled={isCompleted || detail.approvalStatus?.toUpperCase() === 'APPROVED'}
                        placeholder="Nhập vật tư"
                        style={{ width: '120px', textAlign: 'right', fontSize: '14px' }}
                      />
                    ) : (
                      currentMaterialCost.toLocaleString('vi-VN')
                    )}
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
        {(checklist.status === 'IN_PROGRESS' ||
          (checklist.status === 'PENDING_APPROVAL' && hasDeclinedItems())) && (
            <div className="save-changes-section">
              <Button
                className="btn-save-all-changes"
                onClick={handleSaveAllChanges}
                disabled={isUpdating || !hasUnsavedChanges()}
              >
                {isUpdating ? (
                  <>
                    <Loading inline /> Đang lưu...
                  </>
                ) : (
                  <>
                    <FaFloppyDisk />
                    {checklist.status === 'PENDING_APPROVAL'
                      ? 'Cập nhật hạng mục bị từ chối'
                      : 'Lưu tất cả thay đổi'}
                  </>
                )}
              </Button>
              {hasUnsavedChanges() && (
                <small className="unsaved-warning">Bạn có thay đổi chưa được lưu</small>
              )}
            </div>
          )}
      </div>
    </div>
  );
}