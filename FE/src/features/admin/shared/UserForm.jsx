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
  centers = [],
}) {
  if (!showForm) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => !actionLoading && onClose()}
    >
      <div
        className="user-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header với gradient */}
        <div className="modal-header">
          <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
          <button 
            type="button" 
            className="btn-close"
            onClick={onClose}
            disabled={actionLoading}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="user-form" noValidate>
            {/* Họ tên */}
            <div className="form-group">
              <label htmlFor="fullName">Họ tên:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={formErrors.fullName ? 'input-error' : ''}
                aria-describedby="fullNameError"
                aria-invalid={!!formErrors.fullName}
              />
              {formErrors.fullName && (
                <span id="fullNameError" className="error-text">
                  {formErrors.fullName}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? 'input-error' : ''}
                aria-describedby="emailError"
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <span id="emailError" className="error-text">
                  {formErrors.email}
                </span>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={formErrors.phone ? 'input-error' : ''}
                aria-describedby="phoneError"
                aria-invalid={!!formErrors.phone}
              />
              {formErrors.phone && (
                <span id="phoneError" className="error-text">
                  {formErrors.phone}
                </span>
              )}
            </div>

            {/* Mật khẩu (chỉ khi thêm mới) */}
            {!editingUser && (
              <div className="form-group">
                <label htmlFor="password">Mật khẩu:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  className={formErrors.password ? 'input-error' : ''}
                  aria-describedby="passwordError"
                  aria-invalid={!!formErrors.password}
                />
                {formErrors.password && (
                  <span id="passwordError" className="error-text">
                    {formErrors.password}
                  </span>
                )}
              </div>
            )}

            {/* Vai trò */}
            <div className="form-group">
              <label htmlFor="role">Vai trò:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={formErrors.role ? 'input-error' : ''}
                aria-describedby="roleError"
                aria-invalid={!!formErrors.role}
              >
                <option value="">-- Chọn vai trò --</option>
                <option value="STAFF">Staff</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="MANAGER">Manager</option>
                <option value="CUSTOMER">Customer</option>
              </select>
              {formErrors.role && (
                <span id="roleError" className="error-text">
                  {formErrors.role}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="centerId">Trung tâm:</label>
              <select
                id="centerId"
                name="centerId"
                value={formData.centerId || ''}
                onChange={handleChange}
                disabled={
                  formData.role === 'CUSTOMER' || centers.length === 0
                }
                className={formErrors.centerId ? 'input-error' : ''}
                aria-describedby="centerIdError"
                aria-invalid={!!formErrors.centerId}
              >
                <option value="">
                  {formData.role === 'CUSTOMER'
                    ? 'Không áp dụng'
                    : '-- Chọn trung tâm --'}
                </option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>

              {formData.role === 'CUSTOMER' && (
                <small className="field-hint">
                  Customer không thuộc trung tâm nào.
                </small>
              )}
              {formErrors.centerId && (
                <span id="centerIdError" className="error-text">
                  {formErrors.centerId}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <Button 
            type="button" 
            className="btn-save" 
            onClick={handleSubmit}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loading inline />
            ) : (
              <FaSave />
            )}{' '}
            {actionLoading ? 'Đang lưu...' : 'Lưu'}
          </Button>
          <Button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={actionLoading}
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}