import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function HeaderSection() {
  return (
    <header className="page-header">
      <h1><FaCalendarAlt /> Quản lý lịch hẹn</h1>
      <p>Xem xét, phân công và theo dõi các lịch hẹn của khách hàng.</p>
    </header>
  );
}
