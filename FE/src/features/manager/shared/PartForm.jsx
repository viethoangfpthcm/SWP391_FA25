import React from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { FaTimes } from "react-icons/fa";
import "./PartForm.css";

export default function PartForm({
  showForm,
  editingPart,
  formData,
  handleChange,
  handleSubmit,
  actionLoading,
  onClose,
  error,
}) {
  if (!showForm) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingPart ? "Chỉnh sửa số lượng phụ tùng" : "Thêm phụ tùng mới"}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="part-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>
              Tên phụ tùng <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Lọc gió động cơ"
              required
              disabled={!!editingPart}
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về phụ tùng..."
              rows={3}
              disabled={!!editingPart}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Giá (VNĐ) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="500000"
                min="0"
                required
                disabled={!!editingPart}
              />
            </div>

            <div className="form-group">
              <label>
                Số lượng <span className="required">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="100"
                min="0"
                required
              />
            </div>
          </div>

    

          <div className="form-actions">
            <Button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="btn-submit"
              loading={actionLoading === "submit"}
              disabled={actionLoading === "submit"}
            >
              {editingPart ? "Cập nhật số lượng" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
