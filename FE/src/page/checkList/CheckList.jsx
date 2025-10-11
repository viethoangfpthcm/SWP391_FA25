import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar"; // ✅ Gọi lại sidebar có sẵn
import { Save, CheckCircle } from "lucide-react";
import "./CheckList.css";

export default function CheckList() {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const customerId = localStorage.getItem("userId");
        const res = await fetch(
          `http://localhost:8080/api/customer/maintenance/checklists?customerId=${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok)
          throw new Error("Không thể tải dữ liệu (token hết hạn hoặc chưa đăng nhập).");

        const data = await res.json();
        if (data.length > 0) setChecklist(data[0]);
        else setError("Không có dữ liệu bảo dưỡng.");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page-container">
      {/* ✅ Sidebar tái sử dụng */}
      <Sidebar sidebarOpen={true} />

      {/* ✅ Main content */}
      <main className="content">
        <div className="header-bar">
          <div>
            <h2>Bảng Kiểm Tra Xe</h2>
            <p>Work Order: <strong>WO-2024-001</strong></p>
          </div>
          <div className="btn-group">
            <button className="btn-secondary">
              <Save size={16}/> Lưu nháp
            </button>
            <button className="btn-primary">
              <CheckCircle size={16}/> Hoàn thành kiểm tra
            </button>
          </div>
        </div>

        {/* Thông tin xe */}
        <div className="vehicle-card">
          <h3>🚗 Thông tin xe</h3>
          <div className="vehicle-grid">
            <p><strong>Biển số:</strong> {checklist.vehicleNumberPlate}</p>
            <p><strong>Hãng xe:</strong> {checklist.brand || "VinFast"}</p>
            <p><strong>Model:</strong> {checklist.vehicleModel}</p>
            <p><strong>Năm SX:</strong> 2023</p>
            <p><strong>Số km:</strong> {checklist.currentKm} km</p>
            <p><strong>Kỹ thuật viên:</strong> {checklist.technicianName}</p>
            <p><strong>Trạng thái:</strong> {checklist.status}</p>
          </div>
        </div>

        {/* Danh sách hạng mục */}
        <h3 className="section-title">📋 Danh sách kiểm tra</h3>
        {checklist.details && checklist.details.length > 0 ? (
          <table className="checklist-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Hạng mục</th>
                <th>Trạng thái</th>
                <th>Phê duyệt</th>
                <th>Phụ tùng</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {checklist.details.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.itemName}</td>
                  <td className={`status ${item.status === "Tốt" ? "good" : "replace"}`}>
                    {item.status}
                  </td>
                  <td
                    className={`approval ${
                      item.approvalStatus === "APPROVED"
                        ? "approved"
                        : item.approvalStatus === "DECLINED"
                        ? "declined"
                        : "pending"
                    }`}
                  >
                    {item.approvalStatus}
                  </td>
                  <td>{item.partName || "—"}</td>
                  <td>{item.customerNote || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">Không có hạng mục nào.</p>
        )}
      </main>
    </div>
  );
}
