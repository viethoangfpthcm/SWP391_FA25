// src/page/report/Report3.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@config/api.js";
import "./report3.css";
import Button from '@components/ui/Button.jsx';


const Report3 = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/customer/maintenance/checklists`)
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error(err));
  }, []);

  const handleApproval = async (detailId, isApproved) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/maintenance/checklists/details/${detailId}/approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalStatus: isApproved ? "APPROVED" : "DECLINED",
          }),
        }
      );

      if (response.ok) {
        setReports((prev) =>
          prev.map((r) => ({
            ...r,
            details: r.details.map((d) =>
              d.id === detailId
                ? {
                    ...d,
                    approvalStatus: isApproved ? "APPROVED" : "DECLINED",
                  }
                : d
            ),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="report3-page">
      <header className="report3-header">
        <div className="report3-logo">
          <img src="/ev-logo.png" alt="EV Service Center" />
          <h1>EV Service Center</h1>
        </div>
        <p className="report3-subtitle">Maintenance Report Summary</p>
      </header>

      <main className="report3-content">
        {reports.length === 0 ? (
          <p className="no-data">Không có dữ liệu báo cáo.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report3-card">
              <div className="report3-card-header">
                <h2>{report.vehicleModel} - {report.vehicleNumberPlate}</h2>
                <span className={`status ${report.status.toLowerCase()}`}>
                  {report.status}
                </span>
              </div>
              <div className="report3-card-info">
                <p><strong>Kỹ thuật viên:</strong> {report.technicianName}</p>
                <p><strong>Ước tính:</strong> {report.estimatedCost} VND</p>
                <p><strong>Đã duyệt:</strong> {report.totalCostApproved} VND</p>
                <p><strong>Từ chối:</strong> {report.totalCostDeclined} VND</p>
              </div>

              <table className="report3-table">
                <thead>
                  <tr>
                    <th>Hạng mục</th>
                    <th>Tình trạng</th>
                    <th>Trạng thái phê duyệt</th>
                    <th>Chi phí</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {report.details.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{item.status}</td>
                      <td>
                        <span
                          className={`approval-tag ${item.approvalStatus.toLowerCase()}`}
                        >
                          {item.approvalStatus}
                        </span>
                      </td>
                      <td>
                        {(item.laborCost || 0) + (item.materialCost || 0)} VND
                      </td>
                      <td>
                        <Button
                          className="approve-btn"
                          onClick={() => handleApproval(item.id, true)}
                        >
                          Đồng ý
                        </Button>
                        <Button
                          className="decline-btn"
                          onClick={() => handleApproval(item.id, false)}
                        >
                          Từ chối
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Report3;
