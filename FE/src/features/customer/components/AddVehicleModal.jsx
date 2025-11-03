import React, { useState } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";

export default function AddVehicleModal({ onClose, onSuccess }) {
  const [vehicleData, setVehicleData] = useState({
    model: "",
    year: "",
    licensePlate: "",
    currentKm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "";

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
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Model xe"
            value={vehicleData.model}
            onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Năm sản xuất"
            value={vehicleData.year}
            onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Biển số"
            value={vehicleData.licensePlate}
            onChange={(e) => setVehicleData({ ...vehicleData, licensePlate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Số km hiện tại"
            value={vehicleData.currentKm}
            onChange={(e) => setVehicleData({ ...vehicleData, currentKm: e.target.value })}
          />
          {error && <p className="error-text">{error}</p>}
          <div className="modal-buttons">
            <Button type="submit" disabled={loading}>
              {loading ? <Loading inline /> : "Thêm xe"}
            </Button>
            <Button className="btn-cancel" onClick={onClose} type="button">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
