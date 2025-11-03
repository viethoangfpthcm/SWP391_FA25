import React, { useState } from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";

function EditProfileModal({ profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState(profile || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Cập nhật thất bại.");

      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Cập nhật thông tin</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Họ và tên"
            value={formData.fullName || ""}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          {error && <p className="error-text">{error}</p>}

          <div className="modal-buttons">
            <Button type="submit" disabled={loading}>
              {loading ? <Loading inline /> : "Lưu thay đổi"}
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

// ✅ Export default ở cuối file
export default EditProfileModal;
