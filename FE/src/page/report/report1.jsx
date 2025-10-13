import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import "./report1.css";

const Report1 = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Tải danh sách checklist bảo dưỡng của khách hàng
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const customerId = localStorage.getItem("userId");

        if (!token || !customerId) {
          throw new Error("Thiếu token hoặc customerId trong localStorage!");
        }

        const url = `http://localhost:8080/api/customer/maintenance/checklists?customerId=${encodeURIComponent(
          customerId
        )}`;
        console.log("[Report1] GET:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("[Report1] ❌ Response error:", response.status, text);
          if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
          return;
        }

        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : data
          ? [data]
          : [];

        setReports(normalized);
      } catch (error) {
        console.error("[Report1] Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 🔹 Hàm xử lý phê duyệt / từ chối
  // 🔹 Hàm xử lý phê duyệt / từ chối (ĐÃ FIX)
const handleApproval = async (detailId, status) => {
  try {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("userId");
    if (!token || !customerId) throw new Error("Thiếu token hoặc customerId!");

    // Chuyển status sang dạng BE chấp nhận
    const approvalStatus = status === "approved" ? "APPROVED" : "DECLINED";

    const customerNote = prompt("Nhập ghi chú (nếu có):", "");
    const query = new URLSearchParams({
      approvalStatus,
      ...(customerNote ? { customerNote } : {}),
    }).toString();

    const url = `http://localhost:8080/api/customer/maintenance/checklists/details/${detailId}/approval?${query}`;
    console.log("[Report1] PUT:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("[Report1] Approval error:", txt);
      alert("❌ Không thể cập nhật trạng thái!");
      return;
    }

    alert(`✅ Đã ${status === "approved" ? "phê duyệt" : "từ chối"} thành công!`);

    // 🔁 Gọi lại GET để cập nhật UI đúng theo dữ liệu từ backend
    const getUrl = `http://localhost:8080/api/customer/maintenance/checklists?customerId=${encodeURIComponent(customerId)}`;
    const refresh = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const newData = await refresh.json();

    setReports(Array.isArray(newData) ? newData : [newData]);
  } catch (error) {
    console.error("[Report1] Lỗi khi cập nhật:", error);
    alert("Lỗi khi cập nhật trạng thái!");
  }
};


  if (loading) return <p className="loading">🔄 Đang tải dữ liệu...</p>;

  return (
    <div className="report-page">
      <Navbar />

      <main className="main-content">
        <h1>🧾 Biên bản bảo dưỡng & sửa chữa</h1>
        <p className="sub-text">
          Xem và phê duyệt các hạng mục sửa chữa do kỹ thuật viên đề xuất.
        </p>

        {reports.length === 0 ? (
          <p className="no-data">Không có dữ liệu biên bản nào.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h3>{report.scheduleName || "Không có tên lịch trình"}</h3>
                <span className={`status ${report.status || "unknown"}`}>
                  {report.status || "Không xác định"}
                </span>
              </div>

              <div className="report-info">
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Kỹ thuật viên:</strong> {report.technicianName || "Không rõ"}</p>
                <p><strong>Xe:</strong> {report.vehicleModel} - {report.vehicleNumberPlate}</p>
                <p><strong>Số km hiện tại:</strong> {report.currentKm?.toLocaleString() || "N/A"} km</p>
                <p><strong>Mốc bảo dưỡng:</strong> {report.maintenanceKm?.toLocaleString() || "N/A"} km</p>
                <p><strong>Ngày tạo:</strong> {report.createdDate || "N/A"}</p>
                <p><strong>Tổng chi phí dự kiến:</strong> {(report.estimatedCost || 0).toLocaleString()}đ</p>
                <p><strong>Chi phí đã duyệt:</strong> {(report.totalCostApproved || 0).toLocaleString()}đ</p>
                <p><strong>Chi phí bị từ chối:</strong> {(report.totalCostDeclined || 0).toLocaleString()}đ</p>
              </div>

              <h4>🧩 Chi tiết hạng mục</h4>
              {(report.details && report.details.length > 0) ? (
                report.details.map((d) => (
                  <div key={d.id} className="detail-item">
                    <div className="detail-info">
                      <p><strong>Tên hạng mục:</strong> {d.itemName || "Không có tên"}</p>
                      <p><strong>Linh kiện:</strong> {d.partName || "Không rõ"}</p>
                      <p><strong>Số lượng:</strong> {d.partQuantityUsed || 0}</p>
                      <p><strong>Trạng thái:</strong> {d.status || "Không xác định"}</p>
                      <p><strong>Ghi chú kỹ thuật viên:</strong> {d.note || "Không có ghi chú"}</p>
                      <p><strong>Ghi chú khách hàng:</strong> {d.customerNote || "Không có"}</p>
                      <p><strong>Chi phí nhân công:</strong> {(d.laborCost || 0).toLocaleString()}đ</p>
                      <p><strong>Chi phí vật liệu:</strong> {(d.materialCost || 0).toLocaleString()}đ</p>
                      <p><strong>Trạng thái phê duyệt:</strong> {d.approvalStatus || "Chưa xử lý"}</p>
                    </div>

                    <div className="action-btns">
                      <button
                       className={`approve ${d.approvalStatus === "APPROVED" ? "active" : ""}`}
                         onClick={() => handleApproval(d.id, "approved")}
                                      >
                              ✅ Đồng ý
                            </button>
                            <button
                                   className={`reject ${d.approvalStatus === "DECLINED" ? "active" : ""}`}
                                onClick={() => handleApproval(d.id, "rejected")}
                               >
                             ❌ Từ chối
                                </button>

                    </div>
                  </div>
                ))
              ) : (
                <p className="no-detail">Không có hạng mục nào.</p>
              )}
            </div>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Report1;
