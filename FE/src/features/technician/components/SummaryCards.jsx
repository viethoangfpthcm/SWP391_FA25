import React from "react";
import { FaClock, FaScrewdriverWrench, FaCircleCheck, FaClipboardList } from "react-icons/fa6";

export default function SummaryCards({ summary }) {
  return (
    <div className="summary-cards">
      <div className="card pending"><FaClock /><h3>Chờ xử lý</h3><p>{summary.pending}</p></div>
      <div className="card in-progress"><FaScrewdriverWrench /><h3>Đang thực hiện</h3><p>{summary.inProgress}</p></div>
      <div className="card completed"><FaCircleCheck /><h3>Hoàn thành</h3><p>{summary.completed}</p></div>
      <div className="card total"><FaClipboardList /><h3>Tổng nhiệm vụ</h3><p>{summary.total}</p></div>
    </div>
  );
}
