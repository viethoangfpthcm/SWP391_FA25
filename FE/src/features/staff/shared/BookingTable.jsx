// /src/page/staff/BookingTable.jsx
import React from "react";
import BookingRow from "./BookingRow.jsx";

/**
 * Props expected:
 * - appointments (array)
 * - technicians (array)
 * - selectedTechnicians (object)
 * - statusFilter (string)
 * - actionLoading (id|null)
 * - handleTechnicianChange(bookingId, techId)
 * - handleApprove(bookingId)
 * - handleDecline(bookingId)
 * - handleAssign(bookingId)
 * - handleHandover(bookingId)
 * - handleViewChecklist(bookingId)
 */
export default function BookingTable(props) {
  const {
    appointments = [],
    technicians = [],
    selectedTechnicians = {},
    statusFilter = "all",
    actionLoading = null,
    handleTechnicianChange,
    handleApprove,
    handleDecline,
    handleAssign,
    handleHandover,
    handleViewChecklist,
  } = props;

  // filter by status if needed
  const filtered = appointments.filter((a) =>
    statusFilter === "all"
      ? true
      : a.status && a.status.toLowerCase() === statusFilter
  );

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày hẹn</th>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Biển số</th>
              <th>Dòng xe</th>
              <th>Số KM</th>
              <th>Kỹ thuật viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  <p>Hiện không có lịch hẹn phù hợp.</p>
                </td>
              </tr>
            ) : (
              filtered.map((appt) => (
                <BookingRow
                  key={appt.bookingId}
                  appt={appt}
                  technicians={technicians}
                  selectedTechnician={selectedTechnicians[appt.bookingId]}
                  actionLoading={actionLoading}
                  onTechnicianChange={handleTechnicianChange}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onAssign={handleAssign}
                  onHandover={handleHandover}
                  onViewChecklist={handleViewChecklist}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
