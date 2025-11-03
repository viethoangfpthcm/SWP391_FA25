import React from "react";
import { FaUser, FaEdit } from "react-icons/fa";
import Button from "@components/ui/Button.jsx";

function CustomerProfile({ data, onEdit }) {
  return (
    <section className="dashboard-section profile-section">
      <div className="profile-header">
        <h2><FaUser /> Thông tin cá nhân</h2>
        <Button className="edit-profile-btn" onClick={onEdit}>
          <FaEdit /> Tùy chỉnh
        </Button>
      </div>
      {data ? (
        <div className="profile-details">
          <p><strong>Họ và tên:</strong> {data.fullName}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Số điện thoại:</strong> {data.phone}</p>
        </div>
      ) : (
        <p>Không có thông tin khách hàng.</p>
      )}
    </section>
  );
}

// ✅ Export default đặt ở cuối (chuẩn convention)
export default CustomerProfile;
