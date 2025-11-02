import React, { useEffect, useState } from "react";
import "./ManagerBookingManagement.css";

const ManagerBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/manager/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setBookings)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="manager-bookings">
      <h2>Danh sách đặt lịch của trung tâm</h2>
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.customerName}</td>
              <td>{b.date}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerBookingManagement;
