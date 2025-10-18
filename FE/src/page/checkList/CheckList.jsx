import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import { Send, CheckCircle } from "lucide-react";
import "./CheckList.css";
import { useNavigate } from "react-router-dom";

export default function CheckList() {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  const statusOptions = [
    { value: "TỐT", label: "Tốt" },
    { value: "HIỆU CHỈNH", label: "Hiệu chỉnh" },
    { value: "SỬA CHỮA", label: "Sửa chữa" },
    { value: "THAY THẾ", label: "Thay thế" },
  ];

  // 🟢 Fetch checklist
  // 🟢 Fetch checklist
const fetchChecklist = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Thiếu token");

    const res = await fetch("http://localhost:8080/api/technician/my-checklists", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Không thể tải checklist (status ${res.status})`);
    const data = await res.json();

    // 🧾 Log chi tiết dữ liệu
    console.log("📦 Toàn bộ dữ liệu checklist nhận được từ API:");
    console.log(JSON.stringify(data, null, 2)); // log đẹp dễ đọc

    console.log("📦 Tổng số checklist:", data.length);
    data.forEach((item, idx) => {
      console.log(
        `🔹 Checklist ${idx + 1}: ID=${item.id}, Booking ID=${item.bookingId || "N/A"}, Technician=${item.technicianName}`
      );
    });

    if (!data || data.length === 0) {
      setError("Không có checklist cho kỹ thuật viên này");
      return;
    }

    setChecklist(data[0]);
  } catch (err) {
    console.error("❌ Lỗi khi tải checklist:", err);
    setError(err.message || "Lỗi khi tải checklist");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchChecklist();
  }, []);

  // 🟡 Cập nhật backend + reload giá mới
  const handleUpdate = async (detailId, field, value) => {
    if (!checklist) return;

    setChecklist((prev) => {
      const updated = { ...prev };
      updated.details = updated.details.map((item) =>
        item.id === detailId ? { ...item, [field]: value } : item
      );
      return updated;
    });

    try {
      const token = localStorage.getItem("token");
      const item = checklist.details.find((d) => d.id === detailId);

      const status = field === "status" ? value : item?.status || "";
      const note = field === "note" ? value : item?.note || "";
      const partId = field === "partId" ? value : item?.partId || "";

      const url = `http://localhost:8080/api/technician/detail/${detailId}?status=${encodeURIComponent(
        status
      )}&note=${encodeURIComponent(note)}&partId=${partId}`;

      setUpdating(true);
      await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchChecklist();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
    } finally {
      setUpdating(false);
    }
  };

  // 🟢 Nút gửi checklist (chỉ hiển thị thông báo)
  const handleSendToCustomer = () => {
    alert("📨 Gửi checklist cho Customer !");
  };

  // 🟢 Nút hoàn thành checklist (gọi API thật)
  const handleCompleteChecklist = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8080/api/technician/${checklist.id}/complete`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Không thể hoàn thành checklist (status ${res.status})`);

      alert("✅ Checklist đã được đánh dấu là hoàn thành!");

      await fetchChecklist();
      navigate("/staff");
    } catch (err) {
      console.error("❌ Lỗi khi hoàn thành checklist:", err);
      alert("❌ Lỗi khi hoàn thành checklist!");
    }
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!checklist) return <p>Không có dữ liệu hiển thị</p>;

  const totalLaborCost = checklist.details.reduce(
    (sum, d) => sum + (d.laborCost || 0),
    0
  );
  const totalMaterialCost = checklist.details.reduce(
    (sum, d) => sum + (d.materialCost || 0),
    0
  );

  return (
    <div className="page-container">
      <Sidebar sidebarOpen={true} />
      <main className="content">
        <div className="header-bar">
          <div>
            <h2>🧰 Bảng kiểm tra bảo dưỡng</h2>
          </div>
          <div className="btn-group">
            <button className="btn-primary" onClick={handleSendToCustomer}>
              <Send size={16} /> Gửi cho Customer
            </button>

            <button
              className="btn-success"
              onClick={handleCompleteChecklist}
              style={{ marginLeft: "10px" }}
            >
              <CheckCircle size={16} /> Hoàn thành
            </button>
          </div>
        </div>

        <div className="overview-section">
          <h3>📋 Tổng quan bảo dưỡng</h3>
          <div className="overview-grid">
            <p><strong>Tên lịch trình:</strong> {checklist.scheduleName}</p>
            <p><strong>Ngày tạo:</strong> {new Date(checklist.createdDate).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong> {checklist.status}</p>
            <p><strong>Kỹ thuật viên:</strong> {checklist.technicianName}</p>
            <p><strong>Xe:</strong> {checklist.vehicleModel} ({checklist.vehicleNumberPlate})</p>
            <p><strong>Km hiện tại:</strong> {checklist.currentKm?.toLocaleString()} km</p>
            <p><strong>Km bảo dưỡng:</strong> {checklist.maintenanceKm?.toLocaleString()} km</p>
            <p><strong>Chi phí ước tính:</strong> {checklist.estimatedCost?.toLocaleString()}₫</p>
            <p><strong>Đã duyệt:</strong> {checklist.totalCostApproved?.toLocaleString()}₫</p>
            <p><strong>Từ chối:</strong> {checklist.totalCostDeclined?.toLocaleString()}₫</p>
          </div>

          <button
            className="btn-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
        </div>

        {showDetails && (
          <>
            <table className="checklist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hạng mục</th>
                  <th>Trạng thái</th>
                  <th>Phụ tùng (nếu thay thế)</th>
                  <th>Chi phí công</th>
                  <th>Chi phí vật tư</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {checklist.details.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.itemName}</td>

                    <td>
                      <select
                        value={item.status || ""}
                        onChange={(e) =>
                          handleUpdate(item.id, "status", e.target.value)
                        }
                      >
                        <option value="">-- Chọn trạng thái --</option>
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {item.status === "THAY THẾ" ? (
                        <select
                          value={item.partId || ""}
                          onChange={(e) =>
                            handleUpdate(item.id, "partId", e.target.value)
                          }
                        >
                          <option value="">-- Chọn phụ tùng --</option>
                          {item.availableParts?.map((p) => (
                            <option key={p.partId} value={p.partId}>
                              {p.partName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{item.laborCost ? `${item.laborCost.toLocaleString()}₫` : "—"}</td>
                    <td>{item.materialCost ? `${item.materialCost.toLocaleString()}₫` : "—"}</td>

                    <td>
                      <input
                        type="text"
                        value={item.note || ""}
                        placeholder="Nhập ghi chú..."
                        onChange={(e) => handleUpdate(item.id, "note", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}

                <tr className="total-row">
                  <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>
                    Tổng:
                  </td>
                  <td style={{ fontWeight: "bold" }}>{totalLaborCost.toLocaleString()}₫</td>
                  <td style={{ fontWeight: "bold" }}>{totalMaterialCost.toLocaleString()}₫</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {updating && <p className="saving">💾 Đang lưu thay đổi...</p>}
      </main>
    </div>
  );
}
