import React from 'react';
import { FaExclamationTriangle, FaSave } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';

export default function UserForm({
  showForm,
  editingUser,
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  actionLoading,
  onClose,
  error,
}) {
  if (!showForm) return null;

  return (
    <div className="modal-overlay" onClick={() => !actionLoading && onClose() }>
      <div className="modal user-edit-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h2>

        {error && (
          <div className="error-message form-error"><FaExclamationTriangle /> {error}</div>
        )}

        <form onSubmit={handleSubmit} className="user-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Họ tên:</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange}
              className={formErrors.fullName ? 'input-error' : ''} aria-describedby="fullNameError" aria-invalid={!!formErrors.fullName} />
            {formErrors.fullName && <span id="fullNameError" className="error-text">{formErrors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''} aria-describedby="emailError" aria-invalid={!!formErrors.email} />
            {formErrors.email && <span id="emailError" className="error-text">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
              className={formErrors.phone ? 'input-error' : ''} aria-describedby="phoneError" aria-invalid={!!formErrors.phone} />
            {formErrors.phone && <span id="phoneError" className="error-text">{formErrors.phone}</span>}
          </div>

          {!editingUser && (
            <div className="form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự" className={formErrors.password ? 'input-error' : ''} aria-describedby="passwordError" aria-invalid={!!formErrors.password} />
              {formErrors.password && <span id="passwordError" className="error-text">{formErrors.password}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Vai trò:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={formErrors.role ? 'input-error' : ''} aria-describedby="roleError" aria-invalid={!!formErrors.role}>
              <option value="">-- Chọn vai trò --</option>
              <option value="STAFF">Staff</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="CUSTOMER">Customer</option>
              <option value="MANAGER">Manager</option>
            </select>
            {formErrors.role && <span id="roleError" className="error-text">{formErrors.role}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="centerId">Center ID:</label>
            <input type="number" id="centerId" name="centerId" value={formData.centerId} onChange={handleChange} min="1"
              disabled={formData.role === "CUSTOMER"} placeholder={formData.role === "CUSTOMER" ? "Không áp dụng" : "Nhập Center ID"}
              className={formErrors.centerId ? 'input-error' : ''} aria-describedby="centerIdError" aria-invalid={!!formErrors.centerId} />
            {formData.role === "CUSTOMER" && <small className="field-hint">Customer không thuộc trung tâm nào.</small>}
            {formErrors.centerId && <span id="centerIdError" className="error-text">{formErrors.centerId}</span>}
          </div>

          <div className="form-actions">
            <Button type="submit" className="btn-save" disabled={actionLoading}>
              {actionLoading ? <Loading inline /> : <FaSave />} {actionLoading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" className="btn-cancel" onClick={onClose} disabled={actionLoading}>Hủy</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
