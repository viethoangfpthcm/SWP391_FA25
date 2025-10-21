import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import VnPayPaymentButton from '../../components/VnPayPaymentButton.jsx';
import {
  FaCircleCheck, FaXmark, FaTriangleExclamation,
  FaFileInvoice,
  FaChevronRight
} from "react-icons/fa6";
import { FaSpinner, FaTools } from "react-icons/fa";
import "./report1.css";

// Hàm format trạng thái kỹ thuật
const formatTechStatus = (status) => {
  switch (status) {
    case 'TỐT': return 'Tốt';
    case 'HIỆU_CHỈNH': return 'Hiệu chỉnh';
    case 'SỬA_CHỮA': return 'Sửa chữa';
    case 'THAY_THẾ': return 'Thay thế';
    default: return status || 'Chưa rõ';
  }
};

export default function Report1() {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("userId");
  const API_BASE = "https://103.90.226.216:8443";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchReportsList = async () => {
      setLoading(true);
      if (!token || !customerId) { 
        setError("Vui lòng đăng nhập."); 
        setLoading(false); 
        navigate("/"); 
        return; 
      }
      try {
        const listUrl = `${API_BASE}/api/customer/maintenance/checklists?customerId=${encodeURIComponent(customerId)}`;
        const response = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) {
          if (response.status === 401) { 
            setError("Phiên đăng nhập hết hạn."); 
            localStorage.clear(); 
            navigate("/"); 
          } else { 
            throw new Error(`Lỗi ${response.status}`); 
          } 
          return;
        }
        const data = await response.json();

        const processedData = data
          .filter(r => {
            const isCompleted = r.status === "COMPLETED";
            const isPaid = r.bookingStatus === "Paid";
            return !isCompleted || (isCompleted && !isPaid);
          })
          .sort((a, b) => (b.createdDate ? new Date(b.createdDate) : 0) - (a.createdDate ? new Date(a.createdDate) : 0));

        setReportsList(processedData); 
        setError('');
      } catch (err) { 
        console.error("Lỗi tải danh sách:", err); 
        setError("Không thể tải danh sách."); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchReportsList();
  }, [token, customerId, navigate, API_BASE]);

  const handleViewDetails = async (bookingId) => {
    if (!bookingId) return;
    setShowDetailModal(true);
    setDetailLoading(true);
    setCurrentReport(null);

    try {
      const detailUrl = `${API_BASE}/api/customer/maintenance/checklists/${bookingId}`;
      const response = await fetch(detailUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Không thể tải chi tiết.");

      const detailData = await response.json();

      // Mặc định tất cả hạng mục đã phê duyệt
      const detailsWithApproved = detailData.details.map(d => ({
        ...d,
        approvalStatus: d.approvalStatus || "APPROVED"
      }));

      setCurrentReport({ ...detailData, details: detailsWithApproved });
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
      showToast("Lỗi tải chi tiết.", "error");
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => { setShowDetailModal(false); setCurrentReport(null); };

  const handleNoteChange = (detailId, newNote) => {
    setCurrentReport(prev => {
      if (!prev) return null;
      const updated = prev.details.map(d => d.id === detailId ? { ...d, customerNote: newNote } : d);
      return { ...prev, details: updated };
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return <FaTools className="status-icon in-progress" title="Đang xử lý" />;
      case 'PENDING_APPROVAL': return <FaTriangleExclamation className="status-icon pending" title="Chờ phê duyệt" />;
      case 'COMPLETED': return <FaCircleCheck className="status-icon completed" title="Đã hoàn thành" />;
      default: return <FaFileInvoice className="status-icon default" title={status || "?"} />;
    }
  };

  if (loading) return (
    <div className="report-page">
      <Navbar />
      <main className="report-container">
        <div className="loading-state"><FaSpinner className="spinner-icon" /> Đang tải...</div>
      </main>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="report-page">
      <Navbar />
      <main className="report-container">
        <div className="no-data-card">
          <h3><FaXmark /> {error}</h3>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="report-page">
      <Navbar />
      {showDetailModal && (
        <div className="modal-overlay report-modal-overlay">
          <div className="modal-content report-modal-content">
            <button onClick={handleCloseModal} className="close-modal-btn"><FaXmark /></button>
            {detailLoading && (
              <div className="loading-state modal-loading"><FaSpinner className="spinner-icon" /> Tải chi tiết...</div>
            )}
            {!detailLoading && currentReport && (
              <article className="report-document-modal">
                <header className="document-header">
                  <div className="doc-left">
                    <div className="doc-title">BIÊN BẢN</div>
                    <div className="doc-meta">
                      <span>Mã BB: <strong>#{currentReport.id}</strong></span>
                    </div>
                  </div>
                  <div className="doc-status">
                    <div className={`status-pill ${currentReport.status?.toLowerCase()}`}>
                      {currentReport.status === "IN_PROGRESS" ? "Đang xử lý" : (currentReport.status === "COMPLETED" ? "Đã hoàn thành" : currentReport.status || '?')}
                    </div>
                  </div>
                </header>
                <section className="document-body">
                  <div className="left-col">
                    <div className="panel">
                      <h4>Thông tin xe</h4>
                      <div className="kv">
                        <div><span className="k">KTV</span><span className="v">{currentReport.technicianName || "?"}</span></div>
                        <div><span className="k">Xe</span><span className="v">{currentReport.vehicleModel || "?"}</span></div>
                        <div><span className="k">Biển số</span><span className="v">{currentReport.vehicleNumberPlate || "?"}</span></div>
                        <div><span className="k">Số km</span><span className="v">{(currentReport.currentKm || 0).toLocaleString()} km</span></div>
                        <div><span className="k">Mốc BD</span><span className="v">{(currentReport.maintenanceKm || 0).toLocaleString()} km</span></div>
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
                        const techStatusClass = `tech-status-${(d.status || 'unknown').toLowerCase().replace('_', '-')}`;
                        return (
                          <div key={d.id} className="detail-row">
                            <div className="detail-main">
                              <div className="detail-head">
                                <div className="detail-name-status">
                                  <div className="detail-name">{d.itemName}</div>
                                  <span className={`tech-status-tag ${techStatusClass}`}>{formatTechStatus(d.status)}</span>
                                </div>
                                <div className={`approval-tag ${d.approvalStatus?.toLowerCase()}`}>
                                  {d.approvalStatus === "APPROVED" ? "✓ Duyệt" : d.approvalStatus === "DECLINED" ? "✗ Từ chối" : "Chờ"}
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
                                  <textarea id={`note-${d.id}`} value={d.customerNote || ""} onChange={(e) => handleNoteChange(d.id, e.target.value)} placeholder="Nhập ghi chú..." rows={2} />
                                </div>
                              </div>
                            </div>
                            <div className="detail-actions">
                              <label className="approval-checkbox">
                                <input
                                  type="checkbox"
                                  checked={d.approvalStatus !== "DECLINED"} // mặc định duyệt
                                  onChange={(e) =>
                                    setCurrentReport(prev => {
                                      if (!prev) return prev;
                                      const updated = prev.details.map(item =>
                                        item.id === d.id
                                          ? { ...item, approvalStatus: e.target.checked ? "APPROVED" : "DECLINED" }
                                          : item
                                      );
                                      return { ...prev, details: updated };
                                    })
                                  }
                                />
                                Phê duyệt
                              </label>
                            </div>
                          </div>
                        );
                      })
                    ) : (<p>Không có chi tiết hạng mục.</p>)}
                  </div>
                </section>
                <footer className="document-footer-modal">
                  <button className="btn-complete-review" onClick={handleCloseModal}>Đóng</button>
                </footer>
              </article>
            )}
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
            <button className="toast-close" onClick={() => setToast({ show: false, message: "", type: "" })}><FaXmark /></button>
          </div>
        )}
        <h1 className="page-title">Biên bản bảo dưỡng & sửa chữa</h1>
        <p className="page-subtitle">Chọn biên bản để xem chi tiết hoặc thanh toán.</p>
        {reportsList.length === 0 ? (
          <div className="no-data-card"><div className="no-data-icon">📋</div><h3>Chưa có biên bản</h3><p>Biên bản chờ duyệt hoặc chờ thanh toán sẽ hiện ở đây.</p></div>
        ) : (
          <div className="report-list-container">
            {reportsList.map((report) => {
              const statusClass = `status-${(report.status || 'default').toLowerCase().replace('_', '-')}`;
              const isCompleted = report.status === "COMPLETED";
              const isPaid = report.bookingStatus === "Paid";
              const totalAmount = report.totalCostApproved || 0;
              const showPayButton = isCompleted && !isPaid && totalAmount > 0;

              return (
                <div key={report.id} className={`report-list-card ${statusClass}`}>
                  <div
                    className="report-card-main-content"
                    onClick={() => handleViewDetails(report.bookingId)}
                  >
                    <div className="report-card-icon">{getStatusIcon(report.status)}</div>
                    <div className="report-card-info">
                      <h3>{report.planName || '?'} (Xe: {report.vehicleNumberPlate || '?'})</h3>
                      <p>Mã BB: #{report.id} • Trạng thái: {report.status === "COMPLETED" ? "Chờ thanh toán" : (report.status || '?')}</p>
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
        )}
      </main>
      <Footer />
    </div>
  );
}
