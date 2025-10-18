  import React, { useEffect, useState } from "react";
  import Navbar from "../../components/Navbar.jsx";
  import Footer from "../../components/Footer.jsx";
  import "./report1.css";

  export default function Report1() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      // Mock data (hiển thị khi không có backend)
      const mock = [
        {
          id: 1,
          scheduleName: "Bảo dưỡng định kỳ xe Honda City",
          status: "COMPLETED",
          technicianName: "Phạm Văn C",
          vehicleModel: "Honda City 1.5L",
          vehicleNumberPlate: "51H-123.45",
          currentKm: 35600,
          maintenanceKm: 35000,
          createdDate: "2025-10-10",
          estimatedCost: 1450000,
          totalCostApproved: 1200000,
          totalCostDeclined: 250000,
          details: [
            {
              id: 101,
              itemName: "Thay dầu động cơ",
              partName: "Dầu nhớt Motul 5W30",
              partQuantityUsed: 4,
              status: "Hoàn tất",
              note: "Đã thay dầu và lọc dầu",
              customerNote: "Đồng ý thay thế",
              laborCost: 200000,
              materialCost: 800000,
              approvalStatus: "APPROVED",
            },
            {
              id: 102,
              itemName: "Kiểm tra hệ thống phanh",
              partName: "Má phanh trước",
              partQuantityUsed: 2,
              status: "Chờ duyệt",
              note: "Phanh hơi mòn, đề xuất thay",
              customerNote: "Đang xem xét",
              laborCost: 150000,
              materialCost: 300000,
              approvalStatus: "PENDING",
            },
          ],
        },
      ];

      // Giả lập tải dữ liệu
      setTimeout(() => {
        setReports(mock);
        setLoading(false);
      }, 600);
    }, []);

    // Hiển thị thông báo tạm (toast)
    const showToast = (msg, type = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 2800);
    };

    // Cập nhật trạng thái phê duyệt cục bộ (mock)
    const handleApproval = (reportId, detailId, action) => {
      // action = "approved" | "rejected"
      setReports((prev) =>
        prev.map((r) =>
          r.id !== reportId
            ? r
            : {
                ...r,
                details: r.details.map((d) =>
                  d.id === detailId
                    ? {
                        ...d,
                        approvalStatus: action === "approved" ? "APPROVED" : "DECLINED",
                        customerNote:
                          action === "approved"
                            ? (d.customerNote || "") + " — Khách đã phê duyệt"
                            : (d.customerNote || "") + " — Khách đã từ chối",
                      }
                    : d
                ),
              }
        )
      );

      showToast(
        `Đã ${action === "approved" ? "phê duyệt" : "từ chối"} hạng mục #${detailId}`,
        action === "approved" ? "success" : "error"
      );

      // Nếu có API thực tế: gọi PUT ở đây rồi refresh data
      // fetch(`/api/.../approval`, { method: 'PUT', ... })
    };

    if (loading) return <p className="loading">🔄 Đang tải dữ liệu...</p>;

    return (
      <div className="report-page">
        <Navbar />

        <main className="report-container">
          <h1 className="page-title">Biên bản bảo dưỡng & sửa chữa</h1>
          <p className="page-subtitle">
            Xem chi tiết biên bản và phê duyệt từng hạng mục — demo hoạt động ngay trên client.
          </p>

          {reports.length === 0 ? (
            <p className="no-data">Không có dữ liệu biên bản nào.</p>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="report-document">
                {/* ===== Header ===== */}
                <header className="document-header">
                  <div className="doc-left">
                    <div className="doc-title">BIÊN BẢN BẢO DƯỠNG & SỬA CHỮA</div>
                    <div className="doc-meta">
                      <span>
                        Mã biên bản: <strong>#{report.id}</strong>
                      </span>
                      <span>• Ngày: {new Date(report.createdDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="doc-status">
                    <div className={`status-pill ${report.status?.toLowerCase()}`}>
                      {report.status === "COMPLETED" ? "Hoàn tất" : report.status}
                    </div>
                  </div>
                </header>

                {/* ===== Body ===== */}
                <section className="document-body">
                  {/* --- Left side --- */}
                  <div className="left-col">
                    <div className="panel">
                      <h4>Thông tin phương tiện</h4>
                      <div className="kv">
                        <div>
                          <span className="k">Kỹ thuật viên</span>
                          <span className="v">{report.technicianName}</span>
                        </div>
                        <div>
                          <span className="k">Xe</span>
                          <span className="v">{report.vehicleModel}</span>
                        </div>
                        <div>
                          <span className="k">Biển số</span>
                          <span className="v">{report.vehicleNumberPlate}</span>
                        </div>
                        <div>
                          <span className="k">Số km hiện tại</span>
                          <span className="v">{report.currentKm.toLocaleString()} km</span>
                        </div>
                        <div>
                          <span className="k">Mốc bảo dưỡng</span>
                          <span className="v">{report.maintenanceKm.toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>

                    <div className="panel cost-panel">
                      <h4>Tổng chi phí</h4>
                      <div className="cost-row">
                        <div>
                          <div className="cost-label">Dự kiến</div>
                          <div className="cost-value">
                            {report.estimatedCost.toLocaleString()} đ
                          </div>
                        </div>
                        <div>
                          <div className="cost-label">Đã duyệt</div>
                          <div className="cost-value approved">
                            {report.totalCostApproved.toLocaleString()} đ
                          </div>
                        </div>
                        <div>
                          <div className="cost-label">Từ chối</div>
                          <div className="cost-value declined">
                            {report.totalCostDeclined.toLocaleString()} đ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Right side --- */}
                  <div className="right-col">
                    <h4 className="details-title">Chi tiết hạng mục</h4>

                    {report.details.map((d) => {
                      const status = (d.approvalStatus || "PENDING").toLowerCase();
                      const isApproved = d.approvalStatus === "APPROVED";
                      const isDeclined = d.approvalStatus === "DECLINED";

                      return (
                        <div key={d.id} className="detail-row">
                          <div className="detail-main">
                            <div className="detail-head">
                              <div className="detail-name">{d.itemName}</div>
                              <div className={`approval-tag ${status}`}>
                                {isApproved
                                  ? "Đã duyệt"
                                  : isDeclined
                                  ? "Đã từ chối"
                                  : "Chờ duyệt"}
                              </div>
                            </div>

                            <div className="detail-grid">
                              <div>
                                <span className="label">Linh kiện</span>
                                <div className="val">{d.partName}</div>
                              </div>
                              <div>
                                <span className="label">Số lượng</span>
                                <div className="val">{d.partQuantityUsed}</div>
                              </div>
                              <div>
                                <span className="label">Nhân công</span>
                                <div className="val">{d.laborCost.toLocaleString()} đ</div>
                              </div>
                              <div>
                                <span className="label">Vật liệu</span>
                                <div className="val">{d.materialCost.toLocaleString()} đ</div>
                              </div>
                            </div>

                            <div className="detail-note">
                              <div>
                                <strong>Ghi chú kỹ thuật:</strong> {d.note || "-"}
                              </div>
                              <div>
                                <strong>Ghi chú khách hàng:</strong> {d.customerNote || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="detail-actions">
                            <button
                              className={`btn small approve ${isApproved ? "active" : ""}`}
                              onClick={() => handleApproval(report.id, d.id, "approved")}
                              disabled={isApproved}
                              title={isApproved ? "Đã phê duyệt" : "Phê duyệt hạng mục"}
                            >
                              Đồng ý
                            </button>

                            <button
                              className={`btn small reject ${isDeclined ? "active" : ""}`}
                              onClick={() => handleApproval(report.id, d.id, "rejected")}
                              disabled={isDeclined}
                              title={isDeclined ? "Đã từ chối" : "Từ chối hạng mục"}
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ===== Footer ===== */}
                <footer className="document-footer">
                  <div className="sign-box">
                    <div className="label">Kỹ thuật viên</div>
                    <div className="line" />
                    <div className="name">{report.technicianName}</div>
                  </div>

                  <div className="sign-box">
                    <div className="label">Khách hàng</div>
                    <div className="line" />
                    <div className="name">Đã xem & Xác nhận</div>
                  </div>
                </footer>
              </article>
            ))
          )}
        </main>

        <Footer />

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type === "error" ? "err" : "ok"}`}>
            {toast.msg}
          </div>
        )}
      </div>
    );
  }
