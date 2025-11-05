import React, { useState, useEffect } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { API_BASE_URL } from "@config/api.js";

export default function AddVehicleModal({ onClose, onSuccess }) {
  const [vehicleData, setVehicleData] = useState({
    model: "",
    year: "",
    licensePlate: "",
    currentKm: "",
  });
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = API_BASE_URL;

  // Fetch vehicle models from API
  useEffect(() => {
    const fetchVehicleModels = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🚗 Fetching vehicle models from API...");
        console.log("🔑 Token exists:", !!token);
        
        const response = await fetch(`${API_BASE}/api/customer/vehicle-models`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📡 Response status:", response.status);
        console.log("📡 Response OK:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Response error:", errorText);
          throw new Error(`Failed to fetch vehicle models: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Vehicle models received:", data);
        console.log("📊 Type of data:", Array.isArray(data) ? "Array" : typeof data);
        console.log("📏 Data length:", data?.length);
        console.log("🔍 First item:", data?.[0]);
        
        if (Array.isArray(data) && data.length > 0) {
          setVehicleModels(data);
          console.log("✅ Set vehicle models successfully:", data.length, "items");
        } else {
          console.warn("⚠️ No vehicle models found or invalid data format");
          console.warn("⚠️ Data structure:", JSON.stringify(data));
          setError("Không có dữ liệu xe nào.");
        }
      } catch (err) {
        console.error("❌ Error fetching vehicle models:", err);
        console.error("❌ Error details:", err.message);
        setError("Không thể tải danh sách xe. Vui lòng thử lại.");
      } finally {
        setLoadingModels(false);
        console.log("🏁 Loading models finished");
      }
    };

    fetchVehicleModels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`${API_BASE}/api/customer/create-vehicle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...vehicleData, customerId: userId }),
      });

      if (!response.ok) throw new Error("Không thể thêm xe.");

      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Thêm xe thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Thêm xe mới</h2>
        
        {loadingModels ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Loading inline size={40} />
            <p>Đang tải danh sách xe...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <label htmlFor="model">Model xe <span style={{ color: "red" }}>*</span></label>
            <select
              id="model"
              value={vehicleData.model}
              onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">-- Chọn model xe ({vehicleModels.length} xe có sẵn) --</option>
              {vehicleModels.length === 0 ? (
                <option value="" disabled>Không có dữ liệu xe</option>
              ) : (
                vehicleModels.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))
              )}
            </select>

            <label htmlFor="year">Năm sản xuất <span style={{ color: "red" }}>*</span></label>
            <input
              id="year"
              type="number"
              placeholder="Ví dụ: 2023"
              value={vehicleData.year}
              onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />

            <label htmlFor="licensePlate">Biển số xe <span style={{ color: "red" }}>*</span></label>
            <input
              id="licensePlate"
              type="text"
              placeholder="Ví dụ: 51A-12345"
              value={vehicleData.licensePlate}
              onChange={(e) => setVehicleData({ ...vehicleData, licensePlate: e.target.value.toUpperCase() })}
              required
            />

            <label htmlFor="currentKm">Số km hiện tại</label>
            <input
              id="currentKm"
              type="number"
              placeholder="Ví dụ: 15000"
              value={vehicleData.currentKm}
              onChange={(e) => setVehicleData({ ...vehicleData, currentKm: e.target.value })}
              min="0"
            />

            {error && <p className="error-text" style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            
            <div className="modal-buttons">
              <Button type="submit" disabled={loading}>
                {loading ? <Loading inline /> : "Thêm xe"}
              </Button>
              <Button className="btn-cancel" onClick={onClose} type="button" disabled={loading}>
                Hủy
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
