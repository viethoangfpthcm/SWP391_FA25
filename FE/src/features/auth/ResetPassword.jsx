import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from "@config/api.js";
import './ResetPassword.css';
import Button from '@components/ui/Button.jsx';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token không hợp lệ hoặc bị thiếu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Đặt lại mật khẩu không thành công.');
      }

      setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      
      // 3. Chuyển về trang login sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="reset-page">
  <div className="reset-container">
    <form onSubmit={handleSubmit} className="reset-form">
      <h2 className="reset-title">Đặt Lại Mật Khẩu</h2>
      <p className="reset-subtitle">Nhập mật khẩu mới của bạn để tiếp tục</p>
        
        {!token && (
          <div className="error-message">Token không hợp lệ. Vui lòng thử lại.</div>
        )}

        {token && (
          <>
            <label>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="login-btn">
              XÁC NHẬN
            </Button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <Link to="/login" className="back-link">Quay lại Đăng nhập</Link>
      </form>
    </div>
     </div>
  );
};

export default ResetPassword;