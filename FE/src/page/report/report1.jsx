import React, { useEffect, useState } from "react";
import "./report1.css";

const Report1 = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Gọi API lấy danh sách biên bản
  useEffect(() => {
    fetch("http://localhost:8080/api/customer/maintenance/checklists")
      .then((res) => res.json())
      .then((data) => {
        // Đảm bảo data là array
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  // ✅ Xử lý đồng ý / từ chối
  const handleApproval = async (detailId, status) => {
    try {
      await fetch(
        `http://localhost:8080/api/customer/maintenance/checklists/details/${detailId}/approval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      // Cập nhật lại UI
      setReports((prev) =>
        prev.map((r) =>
          r.detailId === detailId ? { ...r, approvalStatus: status } : r
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>;

  return (
    <div className="report-page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="icon">🚗</span>
          <span className="name">EV Service Center</span>
        </div>
        <nav className="nav">
          <a href="#">Trang chủ</a>
          <a href="#">Liên hệ</a>
          <a href="#">Bảng điều khiển</a>
          <a href="#" className="active">
            Theo dõi
          </a>
        </nav>
        <div className="user">
          <span>Xin chào, Nguyễn Văn A</span>
          <button>Đăng xuất</button>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="main-content">
        <h1>Biên bản sửa chữa & Bảo dưỡng</h1>
        <p className="sub-text">
          Xem và phê duyệt các hạng mục sửa chữa do kỹ thuật viên đề xuất
        </p>

        <div className="summary-box">
          <div className="summary-item pending">
            <p>Chờ phê duyệt</p>
            <h2>{reports.filter((r) => r.status === "pending").length}</h2>
          </div>
          <div className="summary-item done">
            <p>Đã hoàn thành</p>
            <h2>{reports.filter((r) => r.status === "done").length}</h2>
          </div>
          <div className="summary-item total">
            <p>Tổng số báo cáo</p>
            <h2>{reports.length}</h2>
          </div>
        </div>

        <h3 className="section-title">📋 Danh sách biên bản</h3>

        {reports.length === 0 ? (
          <p className="no-data">Không có dữ liệu báo cáo nào.</p>
        ) : (
          reports.map((item) => (
            <div key={item.detailId} className="report-card">
              <div className="report-info">
                <div className="report-header">
                  <span className="report-id">{item.reportCode}</span>
                  <span className={`status ${item.status}`}>
                    {item.status === "pending"
                      ? "Chờ phê duyệt"
                      : item.status === "done"
                      ? "Hoàn thành"
                      : item.status}
                  </span>
                </div>
                <p>Ngày tạo: {item.createdDate}</p>
                <p>Kỹ thuật viên: {item.technicianName}</p>
                <p>Dịch vụ: {item.serviceName}</p>
                <p>Xe: {item.vehicleInfo}</p>
              </div>

              <div className="report-actions">
                <p className="price">{item.totalPrice}đ</p>
                <div className="action-btns">
                  <button
                    className={`approve ${
                      item.approvalStatus === "approved" ? "active" : ""
                    }`}
                    onClick={() => handleApproval(item.detailId, "approved")}
                  >
                    Đồng ý
                  </button>
                  <button
                    className={`reject ${
                      item.approvalStatus === "rejected" ? "active" : ""
                    }`}
                    onClick={() => handleApproval(item.detailId, "rejected")}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Report1;
