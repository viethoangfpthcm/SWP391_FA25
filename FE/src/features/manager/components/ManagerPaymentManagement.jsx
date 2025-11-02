import React, { useEffect, useState } from "react";
import "./ManagerPaymentManagement.css";

const ManagerPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/manager/payment", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPayments)
      .catch(console.error);
  }, []);

  return (
    <div className="manager-payments">
      <h2>Thanh toán của trung tâm</h2>
      <table>
        <thead>
          <tr>
            <th>Mã giao dịch</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Ngày thanh toán</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.transactionCode}</td>
              <td>{p.customerName}</td>
              <td>{p.amount}</td>
              <td>{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerPaymentManagement;
