import React, { useEffect, useState } from "react";
import "./CheckList.css";

export default function CheckList() {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/customer/maintenance/checklists", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Không thể tải dữ liệu (chưa xác thực hoặc token hết hạn).");

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
    <div className="checklist-container">
      <h2>Thông tin xe & Danh sách kiểm tra bảo dưỡng</h2>

      {/* --- Thông tin xe --- */}
      <div className="vehicle-info">
        <p><strong>Biển số xe:</strong> {checklist.vehicleNumberPlate}</p>
        <p><strong>Model xe:</strong> {checklist.vehicleModel}</p>
        <p><strong>Số km hiện tại:</strong> {checklist.currentKm} km</p>
        <p><strong>Kỹ thuật viên:</strong> {checklist.technicianName}</p>
        <p><strong>Trạng thái:</strong> {checklist.status}</p>
      </div>

      {/* --- Danh sách hạng mục --- */}
      <h3>Hạng mục bảo dưỡng</h3>
      {checklist.details && checklist.details.length > 0 ? (
        <table className="checklist-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Hạng mục</th>
              <th>Trạng thái</th>
              <th>Phê duyệt</th>
              <th>Phụ tùng</th>
              <th>Ghi chú khách hàng</th>
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
    </div>
  );
}
