import React, { useState } from 'react';
import './StaffDashboard.css';
import Sidebar from '../../page/sidebar/sidebar.jsx';

export default function StaffDashboard({ user, userRole }) {
  const [selectedTechnicians, setSelectedTechnicians] = useState({});

  // Mock data với ngày tháng đã cập nhật
  const customers = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      carModel: 'VF-E34',
      vin: '123456789',
      lastService: '2025-09-10'
    },
    {
      id: '2',
      name: 'Trần Thị B',
      phone: '0902345678',
      carModel: 'VF-8',
      vin: '234567890',
      lastService: '2025-08-15'
    }
  ];

  const appointments = [
    {
      id: '1',
      date: '2025-10-15',
      customer: 'Nguyễn Văn A',
      service: 'Bảo dưỡng định kỳ',
      technician: null,
      status: 'pending',
      inspectionStatus: 'Chờ phân công'
    },
    {
      id: '2',
      date: '2025-10-16',
      customer: 'Trần Thị B',
      service: 'Thay ắc quy',
      technician: 'Lê C',
      status: 'assigned',
      inspectionStatus: 'Đã phân công'
    },
    {
      id: '3',
      date: '2025-10-17',
      customer: 'Hoàng Minh E',
      service: 'Kiểm tra hệ thống pin',
      technician: null,
      status: 'pending',
      inspectionStatus: 'Chờ phân công'
    }
  ];

  const staff = [
    {
      id: '1',
      name: 'Trần B',
      position: 'Kỹ thuật viên',
      shift: 'Sáng',
      certification: 'EV Level 2',
      performance: 95,
      currentTasks: 0,
      status: 'available'
    },
    {
      id: '2',
      name: 'Lê C',
      position: 'Kỹ thuật viên',
      shift: 'Chiều',
      certification: 'EV Level 1',
      performance: 88,
      currentTasks: 1,
      status: 'busy'
    },
    {
      id: '3',
      name: 'Phạm D',
      position: 'Kỹ thuật viên',
      shift: 'Sáng',
      certification: 'EV Level 3',
      performance: 92,
      currentTasks: 0,
      status: 'available'
    },
    {
      id: '4',
      name: 'Vũ E',
      position: 'Kỹ thuật viên',
      shift: 'Chiều',
      certification: 'EV Level 2',
      performance: 90,
      currentTasks: 2,
      status: 'busy'
    }
  ];

  const handleTechnicianChange = (appointmentId, technicianId) => {
    setSelectedTechnicians({
      ...selectedTechnicians,
      [appointmentId]: technicianId
    });
  };

  const handleApprove = (appointmentId) => {
    const technicianId = selectedTechnicians[appointmentId];
    if (!technicianId) {
      alert('Vui lòng chọn kỹ thuật viên trước khi xác nhận!');
      return;
    }
    const technician = staff.find(s => s.id === technicianId);
    alert(`Đã phân công kỹ thuật viên ${technician.name} cho lịch hẹn ${appointmentId}`);
  };

  const handleDecline = (appointmentId) => {
    if (window.confirm('Bạn có chắc muốn từ chối lịch hẹn này?')) {
      alert(`Đã từ chối lịch hẹn ${appointmentId}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Chờ phân công</span>;
      case 'assigned':
        return <span className="status-badge status-assigned">Đã phân công</span>;
      case 'in_progress':
        return <span className="status-badge status-inprogress">Đang thực hiện</span>;
      case 'completed':
        return <span className="status-badge status-completed">Hoàn tất</span>;
      default:
        return <span className="status-badge status-default">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container">
        <Sidebar sidebarOpen={true} />

      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="current">Quản lý lịch hẹn</span>
          </div>
          <div className="header-right">
            {userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="content-wrapper">
            {/* Page Title */}
            <div className="page-title-section">
              <h1 className="page-title">Quản lý lịch hẹn & phân công</h1>
              <p className="page-subtitle">Phân công kỹ thuật viên và quản lý lịch hẹn dịch vụ</p>
            </div>

            {/* Actions Bar */}
            <div className="actions-bar">
              <div className="action-buttons">
                <button className="btn btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  Quản lý hàng chờ
                </button>
                <button className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Lập lịch mới
                </button>
              </div>
            </div>

            {/* Table Card */}
            <div className="table-card">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Khách hàng</th>
                      <th>Dịch vụ</th>
                      <th>Kỹ thuật viên</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      const selectedTech = selectedTechnicians[appointment.id];
                      const techInfo = selectedTech ? staff.find(s => s.id === selectedTech) : null;
                      
                      return (
                        <tr key={appointment.id}>
                          <td>
                            <div className="cell-main">{appointment.date}</div>
                          </td>
                          <td>
                            <div className="cell-main">{appointment.customer}</div>
                          </td>
                          <td>
                            <div className="cell-main">{appointment.service}</div>
                          </td>
                          <td>
                            {appointment.status === 'pending' ? (
                              <div className="technician-select-wrapper">
                                <select 
                                  className="technician-select"
                                  value={selectedTech || ''}
                                  onChange={(e) => handleTechnicianChange(appointment.id, e.target.value)}
                                >
                                  <option value="">-- Chọn kỹ thuật viên --</option>
                                  {staff.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                      {tech.name} {tech.status === 'busy' ? '(Đang bận)' : '(Rảnh)'}
                                    </option>
                                  ))}
                                </select>
                                {techInfo && techInfo.status === 'busy' && (
                                  <div className="cell-extra tech-note">
                                    ⚠️ Kỹ thuật viên đang có {techInfo.currentTasks} công việc
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="cell-main">{appointment.technician}</div>
                            )}
                          </td>
                          <td>
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td>
                            {appointment.status === 'pending' ? (
                              <div className="action-buttons-cell">
                                <button 
                                  className="btn-action btn-approve"
                                  onClick={() => handleApprove(appointment.id)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                  Xác nhận
                                </button>
                                <button 
                                  className="btn-action btn-decline"
                                  onClick={() => handleDecline(appointment.id)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <button className="btn-action btn-view">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Xem
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}