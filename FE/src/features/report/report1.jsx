import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import VnPayPaymentButton from "@components/shared/VnPayPaymentButton.jsx";
import {
  FaCircleCheck, FaXmark, FaTriangleExclamation,
  FaFileInvoice,
  FaChevronRight, FaChevronDown, FaChevronUp
} from "react-icons/fa6";
import { FaSpinner, FaTools, FaCalendarAlt } from "react-icons/fa";
import "./report1.css";
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import { API_BASE_URL } from "@config/api.js";

// Hàm format nằm ngoài component
const formatTechStatus = (status) => {
  switch (status) {
    case 'GOOD': return 'Tốt';
    case 'ADJUSTMENT': return 'Hiệu chỉnh';
    case 'REPAIR': return 'Sửa chữa';
    case 'REPLACE': return 'Thay thế';
    case 'PENDING': return 'Chờ kiểm tra';
    default: return status || 'Chưa rõ';
  }
};

export default function Report1() {
  // === State ===
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", callback: null });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [originalReport, setOriginalReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("userId");
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const restoredToken = params.get("clientToken");
  if (restoredToken) {
    localStorage.setItem("token", restoredToken);
    // Xóa token khỏi URL để sạch sẽ
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);
  

  // === Hàm xử lý ===
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchReportsList = async () => {
      setLoading(true);
      setError(''); // Reset lỗi trước khi fetch
      if (!token || !customerId) {
        setError("Vui lòng đăng nhập.");
        setLoading(false);
        navigate("/");
        return;
      }
      try {
        const listUrl = `${API_BASE_URL}/api/customer/maintenance/checklists?customerId=${encodeURIComponent(customerId)}`;
        const response = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Phiên đăng nhập hết hạn.");
            localStorage.clear();
            navigate("/");
          } else {
            throw new Error(`Lỗi tải danh sách: ${response.status}`);
          }
          return; // Dừng lại nếu có lỗi
        }

        const data = await response.json();
        const processedData = data.sort((a, b) => {
          const getPriority = (report) => {
            const s = report.status;
            const bS = report.bookingStatus;
            if (s === "PENDING_APPROVAL") return 1;
            if (s === "IN_PROGRESS") return 2;
            if (s === "COMPLETED" && bS !== "COMPLETED") return 3;
            if (s === "COMPLETED" && bS === "COMPLETED") return 4;
            return 5;
          };

          const priorityA = getPriority(a);
          const priorityB = getPriority(b);
          if (priorityA !== priorityB) return priorityA - priorityB;
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          return dateB - dateA;
        });

        setReportsList(processedData);
        setError('');

      } catch (err) {
        console.error("Lỗi tải danh sách biên bản:", err);
        setError(err.message || "Không thể tải danh sách biên bản.");
      }
      finally {
        setLoading(false);
      }
    };

    fetchReportsList();

  }, [token, customerId, navigate, lastUpdated]);

  const handleViewDetails = async (bookingId) => {
    if (!bookingId) return;
    setShowDetailModal(true); setDetailLoading(true); setCurrentReport(null);
    try {
      const detailUrl = `${API_BASE_URL}/api/customer/maintenance/checklists/${bookingId}`;
      const response = await fetch(detailUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) { throw new Error("Không thể tải chi tiết."); }
      const detailData = await response.json();

      let updatedApprovedCost = detailData.totalCostApproved || 0;
      let updatedDeclinedCost = detailData.totalCostDeclined || 0;

      const processedDetails = detailData.details.map(d => {
        if (d.approvalStatus === 'PENDING' || !d.approvalStatus) {

          const cost = (d.laborCost || 0) + (d.materialCost || 0);

          updatedApprovedCost += cost;

          return { ...d, approvalStatus: 'APPROVED' };
        }

        return d;
      });
      const processedReport = {
        ...detailData,
        details: processedDetails,
        totalCostApproved: updatedApprovedCost,
        totalCostDeclined: updatedDeclinedCost
      };
      setCurrentReport(processedReport);
      setOriginalReport(JSON.parse(JSON.stringify(detailData)));

    } catch (err) { console.error("Lỗi tải chi tiết:", err); showToast("Lỗi tải chi tiết.", "error"); handleCloseModal(); }
    finally { setDetailLoading(false); }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setCurrentReport(null);
    setOriginalReport(null);
    setLastUpdated(Date.now());
  };

  const handleNoteChange = (detailId, newNote) => {
    setCurrentReport(prev => {
      if (!prev) return null;
      const updated = prev.details.map(d => d.id === detailId ? { ...d, customerNote: newNote } : d);
      return { ...prev, details: updated };
    });
  };
  const handleCheckboxChange = (detailId, isChecked) => {
    const newStatus = isChecked ? 'APPROVED' : 'DECLINED';

    setCurrentReport(prev => {
      if (!prev) return null;

      const oldDetail = prev.details.find(d => d.id === detailId);
      if (!oldDetail) return prev;

      const cost = (oldDetail.laborCost || 0) + (oldDetail.materialCost || 0);
      let approvedCost = prev.totalCostApproved || 0;
      let declinedCost = prev.totalCostDeclined || 0;

      if (newStatus === 'APPROVED' && oldDetail.approvalStatus !== 'APPROVED') {
        approvedCost += cost;
        if (oldDetail.approvalStatus === 'DECLINED') declinedCost -= cost;
      } else if (newStatus === 'DECLINED' && oldDetail.approvalStatus !== 'DECLINED') {
        declinedCost += cost;
        if (oldDetail.approvalStatus === 'APPROVED') approvedCost -= cost;
      }

      const updatedDetails = prev.details.map(d =>
        d.id === detailId ? { ...d, approvalStatus: newStatus } : d
      );

      return {
        ...prev,
        details: updatedDetails,
        totalCostApproved: Math.max(0, approvedCost),
        totalCostDeclined: Math.max(0, declinedCost)
      };
    });
  };

  const handleSubmitApprovals = async () => {
    if (!currentReport || !originalReport) return;

    // Tìm tất cả hạng mục có thay đổi (về status hoặc note)
    const changes = currentReport.details.filter(d => {
      const original = originalReport.details.find(o => o.id === d.id);
      if (!original) return false;
      return d.approvalStatus !== original.approvalStatus || d.customerNote !== original.customerNote;
    });

    if (changes.length === 0) {
      showToast("Không có thay đổi để lưu.", "info");
      return;
    }

    setIsSubmitting(true);
    showToast(`Đang cập nhật ${changes.length} mục...`, "info");

    const updatePromises = changes.map(detail => {
      const approvalUrl = `${API_BASE_URL}/api/customer/maintenance/checklists/details/${detail.id}/approval`;
      return fetch(approvalUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus: detail.approvalStatus,
          customerNote: detail.customerNote || ""
        })
      }).then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text || `Lỗi ${response.status}`) });
        }
        return { id: detail.id, status: 'fulfilled' };
      }).catch(error => {
        return { id: detail.id, status: 'rejected', error: error.message };
      });
    });

    const results = await Promise.all(updatePromises);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    setIsSubmitting(false);

    if (errorCount > 0) {
      const failedIds = results.filter(r => r.status === 'rejected').map(r => r.id).join(', ');
      showToast(`Lỗi: ${errorCount} mục thất bại (ID: ${failedIds}). Vui lòng tải lại.`, "error");
      // Tải lại chi tiết modal để đồng bộ với server
      handleViewDetails(currentReport.bookingId);
    } else {
      showToast(`Đã cập nhật ${successCount} mục!`, "success");
      handleCloseModal(); // Thành công, đóng modal (sẽ trigger tải lại list)
    }
  };

  const getStatusIcon = (status) => {

    switch (status) {
      case 'IN_PROGRESS': return <FaTools className="status-icon in-progress" title="Đang xử lý" />;
      case 'PENDING_APPROVAL': return <FaTriangleExclamation className="status-icon pending" title="Chờ phê duyệt" />;
      case 'COMPLETED': return <FaCircleCheck className="status-icon completed" title="Đã hoàn thành" />;
      default: return <FaFileInvoice className="status-icon default" title={status || "?"} />;
    }
  };

  // ---------------- RENDER ----------------
  if (loading) return (<div className="report-page"><Navbar /><main className="report-container"><div className="loading-state"><Loading inline /> Đang tải...</div></main><Footer /></div>);
  if (error) return (<div className="report-page"><Navbar /><main className="report-container"><div className="no-data-card"><h3><FaXmark /> {error}</h3></div></main><Footer /></div>);

  return (
    <div className="report-page">
      <Navbar />
      {showDetailModal && (
        <div className="modal-overlay report-modal-overlay">
          <div className="modal-content report-modal-content">
            {confirmModal.show && (
              <div className="confirm-modal-overlay nested">
                <div className="confirm-modal-content">
                  <h4>Xác nhận</h4> <p>{confirmModal.message}</p>
                  <div className="confirm-modal-actions">
                    <Button className="btn btn-cancel" onClick={() => setConfirmModal({ show: false, callback: null })}>Hủy</Button>
                    <Button className="btn btn-confirm" onClick={() => { if (confirmModal.callback) confirmModal.callback(); setConfirmModal({ show: false, callback: null }); }}>Xác nhận</Button>
                  </div>
                </div>
              </div>
            )}
            <Button onClick={handleCloseModal} className="close-modal-btn"><FaXmark /></Button>
            {detailLoading && (<div className="loading-state modal-loading"><Loading inline /> Tải chi tiết...</div>)}
            {!detailLoading && currentReport && (() => {

              const isReportCompleted = currentReport.status === "COMPLETED";
              const hasPendingTechnicianStatus = currentReport.details.some(
                d => d.status === 'PENDING' || !d.status
              );

              return (
                <article className="report-document-modal">
                  <header className="document-header">
                    <div className="doc-left"><div className="doc-title">BIÊN BẢN</div><div className="doc-meta"><span>Mã BB: <strong>#{currentReport.id}</strong></span></div></div>

                    <div className="doc-status">
                      <div className={`status-pill ${currentReport.status?.toLowerCase().replace('_', '-')}`}>
                        {currentReport.status === "IN_PROGRESS" ? "Đang xử lý"
                          : currentReport.status === "PENDING_APPROVAL" ? "Chờ duyệt cuối"
                            : currentReport.status === "COMPLETED" ? "Đã hoàn thành"
                              : currentReport.status || '?'}
                      </div>

                    </div>
                  </header>
                  <section className="document-body">
                    <div className="left-col">
                      <div className="panel">
                        <h4>Thông tin xe</h4>
                        <div className="kv">
                          <div><span className="k">KTV: </span><span className="v">{currentReport.technicianName || "?"}</span></div>
                          <div><span className="k">Xe: </span><span className="v">{currentReport.vehicleModel || "?"}</span></div>
                          <div><span className="k">Biển số: </span><span className="v">{currentReport.vehicleNumberPlate || "?"}</span></div>
                          <div><span className="k">Số km: </span><span className="v">{(currentReport.currentKm || 0).toLocaleString()} km</span></div>
                          <div><span className="k">Mốc bảo dưỡng: </span><span className="v">{(currentReport.maintenanceKm || 0).toLocaleString()} km</span></div>
                        </div>
                      </div>
                      <div className="panel cost-panel">
                        <h4>Chi phí</h4>
                        <div className="cost-row">
                          <div><div className="cost-label">Dự kiến</div><div className="cost-value">{(currentReport.estimatedCost || 0).toLocaleString()} đ</div></div>
                          <div><div className="cost-label">Đã duyệt</div><div className="cost-value approved">{(currentReport.totalCostApproved || 0).toLocaleString()} đ</div></div>
                          <div><div className="cost-label">Từ chối</div><div className="cost-value declined">{(currentReport.totalCostDeclined || 0).toLocaleString()} đ</div></div>
                        </div>
                      </div>
                    </div>
                    <div className="right-col">
                      <h4 className="details-title">Chi tiết hạng mục</h4>
                      {currentReport.details && currentReport.details.length > 0 ? (
                        currentReport.details.map((d) => {
                          const isDeclined = d.approvalStatus === "DECLINED";
                          const isApproved = !isDeclined;
                          const status = isDeclined ? 'declined' : 'approved';

                          const isTechStatusPending = d.status === 'PENDING' || !d.status;
                          const isDisabled = isReportCompleted || isTechStatusPending;
                          const techStatusClass = `tech-status-${(d.status || 'unknown').toLowerCase().replace('_', '-')}`;
                          return (
                            <div key={d.id} className="detail-row">
                              <div className="detail-main">
                                <div className="detail-head">
                                  <div className="detail-name-status">
                                    <div className="detail-name">{d.itemName}</div>
                                    <span className={`tech-status-tag ${techStatusClass}`}>{formatTechStatus(d.status)}</span>
                                    <div className={`approval-tag ${status}`}>
                                      {isApproved ? "✓ Duyệt" : "✗ Từ chối"}
                                    </div>
                                  </div>

                                </div>
                                <div className="detail-grid">
                                  <div><span className="label">Linh kiện</span><div className="val">{d.partName || "-"}</div></div>
                                  <div><span className="label">Nhân công</span><div className="val">{(d.laborCost || 0).toLocaleString()} đ</div></div>
                                  <div><span className="label">Vật liệu</span><div className="val">{(d.materialCost || 0).toLocaleString()} đ</div></div>
                                </div>
                                <div className="detail-note">
                                  <div><strong>Ghi chú KT:</strong> {d.note || "-"}</div>
                                  <div className="customer-note-input">
                                    <label htmlFor={`note-${d.id}`}><strong>Ghi chú của bạn:</strong></label>
                                    <textarea
                                      id={`note-${d.id}`}
                                      value={d.customerNote || ""}
                                      onChange={(e) => handleNoteChange(d.id, e.target.value)}
                                      placeholder="Nhập ghi chú..."
                                      rows={2}
                                      disabled={isDisabled}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="detail-approval-toggle">
                                <input
                                  type="checkbox"
                                  id={`approve-${d.id}`}
                                  checked={d.approvalStatus !== 'DECLINED'}
                                  onChange={(e) => handleCheckboxChange(d.id, e.target.checked)}
                                  disabled={isDisabled}
                                />
                                <label htmlFor={`approve-${d.id}`} style={{ color: '#ffffff' }}>
                                  <span className={`approval-box ${isApproved ? 'approved' : 'declined'}`} aria-hidden="true">
                                    {isApproved ? '✓' : 'X'}
                                  </span>
                                  {d.approvalStatus !== 'DECLINED' ? 'Đồng ý' : 'Không đồng ý'}
                                </label>
                              </div>
                            </div>
                          );
                        })
                      ) : (<p>Không có chi tiết hạng mục.</p>)}
                    </div>
                  </section>
                  <footer className="document-footer-modal">

                    <Button
                      className="btn-close-review"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                    >

                      {isReportCompleted ? 'Đóng' : 'Hủy'}
                    </Button>

                    {!isReportCompleted && (
                      <Button
                        className="btn-submit-review"
                        onClick={handleSubmitApprovals}

                        disabled={isSubmitting || hasPendingTechnicianStatus}
                        title={hasPendingTechnicianStatus
                          ? "Vui lòng đợi Kỹ thuật viên hoàn tất kiểm tra tất cả hạng mục"
                          : "Lưu & Xác nhận"}
                      >
                        {isSubmitting ? (
                          <>
                            <Loading inline /> Đang lưu...
                          </>
                        ) : (
                          'Lưu & Xác nhận'
                        )}
                      </Button>
                    )}
                  </footer>
                </article>
              );
            })()}
          </div>
        </div>
      )}

      <main className="report-container">
        {toast.show && (
          <div className={`toast-notification toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && <FaCircleCheck />}
              {toast.type === "error" && <FaXmark />}
              {toast.type === "warning" && <FaTriangleExclamation />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <Button
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            >
              <FaXmark />
            </Button>
          </div>
        )}

        <h1 className="page-title">Biên bản bảo dưỡng & sửa chữa</h1>
        <p className="page-subtitle">
          Chọn biên bản để xem chi tiết hoặc thanh toán.
        </p>

        {reportsList.length === 0 ? (
          <div className="no-data-card">
            <div className="no-data-icon">📋</div>
            <h3>Chưa có biên bản</h3>
            <p>Biên bản chờ duyệt hoặc chờ thanh toán sẽ hiện ở đây.</p>
          </div>
        ) : (
          <div className="car-report-grid">
            {/* 🔹 Nhóm danh sách theo biển số xe */}
            {Object.entries(
              reportsList.reduce((acc, report) => {
                const car = report.vehicleNumberPlate || "Không rõ";
                if (!acc[car]) acc[car] = [];
                acc[car].push(report);
                return acc;
              }, {})
            ).map(([car, reports]) => (
              <div key={car} className="car-report-section">
                <h3 className="car-section-title">Xe {car}</h3>

                <div className="report-list-container">
                  {reports.map((report) => {
                    const statusClass = `status-${(report.status || "default")
                      .toLowerCase()
                      .replace("_", "-")}`;

                    const isCompleted = report.status === "COMPLETED";
                    const isPaid = report.bookingStatus === "PAID";
                    const isBookingCompleted = report.bookingStatus === "COMPLETED";
                    const totalAmount = report.totalCostApproved || 0;

                    const showPayButton =
                      !isBookingCompleted &&
                      isCompleted &&
                      !isPaid &&
                      totalAmount > 0;

                    return (
                      <div
                        key={report.id}
                        className={`report-list-card ${statusClass}`}
                      >
                        <div
                          className="report-card-main-content"
                          onClick={() => handleViewDetails(report.bookingId)}
                        >
                          <div className="report-card-icon">
                            {getStatusIcon(report.status)}
                          </div>
                          <div className="report-card-info">
                            <h3>
                              {report.planName || "?"}{" "}
                              <span className="car-inline">
                                ({report.vehicleNumberPlate || "?"})
                              </span>
                            </h3>
                            <p>
                              Mã BB: #{report.id} • Trạng thái:{" "}
                              {report.status === "IN_PROGRESS" ? "Đang xử lý"
                                : report.status === "PENDING_APPROVAL" ? "Chờ duyệt cuối"            
                                  : report.status === "COMPLETED" ? (isPaid || isBookingCompleted ? "Đã hoàn thành" : "Chờ thanh toán")
                                    : report.status || "?"} 
                            </p>
                          </div>
                          <div className="report-card-action">
                            {!showPayButton && <FaChevronRight />}
                          </div>
                        </div>

                        {showPayButton && (
                          <div className="report-card-payment-section">
                            <VnPayPaymentButton
                              bookingId={report.bookingId}
                              totalAmount={totalAmount}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}