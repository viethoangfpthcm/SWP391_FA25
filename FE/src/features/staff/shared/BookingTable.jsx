import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Loading from "@components/ui/Loading.jsx";
import TechnicianSelect from "./TechnicianSelect";
import BookingActions from "./BookingActions";
import "./BookingTable.css";

const BOOKING_STATUS_MAP = {
  PENDING: { text: 'Chờ xử lý', className: 'status-pending' },
  APPROVED: { text: 'Đã duyệt', className: 'status-approved' },
  ASSIGNED: { text: 'Đã gán thợ', className: 'status-assigned' },
  IN_PROGRESS: { text: 'Đang xử lý', className: 'status-inprogress' },
  COMPLETED: { text: 'Hoàn thành', className: 'status-completed' },
  PAID: { text: 'Đã thanh toán', className: 'status-paid' },
  CANCELLED: { text: 'Đã hủy', className: 'status-cancelled' },
  DECLINED: { text: 'Đã từ chối', className: 'status-declined' },
};

const getStatusDisplay = (status) => {
  return BOOKING_STATUS_MAP[status] || { text: status || 'Không rõ', className: 'status-default' };
};

export default function BookingTable({
  bookings,
  loading,
  error,
  statusFilter,
  technicians,
  selectedTechnicians,
  actionLoading,
  onTechnicianChange,
  onApprove,
  onDecline,
  onAssign,
  onHandover,
  onViewChecklist,
  onViewFeedback,
  onViewPayment,
}) {
  if (loading) {
    return (
      <div className="table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="10" className="empty-state">
                  <Loading inline /> Đang tải lịch hẹn...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="10" className="empty-state error-in-table">
                  <FaExclamationTriangle />
                  <p>Đã xảy ra lỗi khi tải dữ liệu.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="10" className="empty-state">
                  <p>
                    {statusFilter === 'all'
                      ? 'Hiện không có lịch hẹn nào.'
                      : `Không có lịch hẹn nào ở trạng thái "${getStatusDisplay(statusFilter.toUpperCase()).text}".`}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-date">Ngày hẹn</th>
              <th className="col-customer">Khách hàng</th>
              <th style={{ width: '5%' }}>Điện thoại</th>
              <th style={{ width: '7%' }}>Biển số</th>
              <th style={{ width: '12%' }}>Dòng xe</th>
              <th style={{ width: '6%' }}>Số KM</th>
              <th style={{ width: '13%' }}>Kỹ thuật viên</th>
              <th style={{ width: '6%' }}>Trạng thái</th>
              <th style={{ width: '13%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((appt) => {
              const statusText = appt.status?.toLowerCase() || '';
              const checklistStatusText = appt.checklistStatus?.toLowerCase() || '';

              const isPending = statusText === 'pending';
              const isApproved = statusText === 'approved';
              const isAssigned = statusText === 'assigned';
              const isInProgress = statusText === 'in_progress';
              const isPaid = statusText === 'paid';
              const isCompleted = statusText === 'completed';
              const isChecklistCompleted = checklistStatusText === 'completed';
              const hasAssignedTech = !!appt.technicianName;

              return (
                <tr key={appt.bookingId}>
                  <td className="col-id-cell">
                    <span className="cell-main">#{appt.bookingId}</span>
                  </td>
                  <td className="col-date">
                    <span className="cell-main">
                      {new Date(appt.bookingDate).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="cell-sub">
                      {new Date(appt.bookingDate).toLocaleTimeString("vi-VN", {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="col-customer">
                    <span className="cell-main">{appt.customerName}</span>
                  </td>
                  <td>
                    <span className="cell-sub">{appt.customerPhone || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="cell-main">{appt.vehiclePlate}</span>
                  </td>
                  <td>
                    <span className="cell-sub">{appt.vehicleModel}</span>
                  </td>
                  <td>
                    <span className="cell-sub">
                      {appt.currentKm ? appt.currentKm.toLocaleString() + ' km' : 'N/A'}
                    </span>
                  </td>
                  <td>
                    {isApproved && !hasAssignedTech ? (
                      <TechnicianSelect
                        bookingId={appt.bookingId}
                        technicians={technicians}
                        selectedTechnicians={selectedTechnicians}
                        onTechnicianChange={onTechnicianChange}
                        disabled={actionLoading === appt.bookingId}
                      />
                    ) : isPending ? (
                      <span className="cell-sub">Chờ duyệt</span>
                    ) : (
                      <span className="cell-sub">{appt.technicianName || '—'}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusDisplay(appt.status).className}`}>
                      {getStatusDisplay(appt.status).text}
                    </span>
                  </td>
                  <td>
                    <BookingActions
                      booking={appt}
                      isPending={isPending}
                      isApproved={isApproved}
                      hasAssignedTech={hasAssignedTech}
                      isPaid={isPaid}
                      isChecklistCompleted={isChecklistCompleted}
                      isAssigned={isAssigned}
                      isInProgress={isInProgress}
                      isCompleted={isCompleted}
                      actionLoading={actionLoading}
                      selectedTechnicians={selectedTechnicians}
                      onApprove={onApprove}
                      onDecline={onDecline}
                      onAssign={onAssign}
                      onHandover={onHandover}
                      onViewChecklist={onViewChecklist}
                      onViewFeedback={onViewFeedback}
                      onViewPayment={onViewPayment}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}