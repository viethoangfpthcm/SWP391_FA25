import React, { useEffect, useState } from "react";
import "./ManagerPartManagement.css";import Button from '@components/ui/Button.jsx';


const ManagerPartManagement = () => {
  const [parts, setParts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/manager/parts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setParts)
      .catch(console.error);
  }, []);

  const handleAddPart = async () => {
    const name = prompt("Tên linh kiện:");
    const quantity = prompt("Số lượng:");
    const price = prompt("Giá:");
    await fetch("/api/manager/parts-create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, quantity, price }),
    });
    window.location.reload();
  };

  return (
    <div className="manager-parts">
      <h2>Quản lý linh kiện</h2>
      <Button onClick={handleAddPart}>+ Thêm linh kiện</Button>
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Số lượng</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => (
            <tr key={p.partId}>
              <td>{p.name}</td>
              <td>{p.quantity}</td>
              <td>{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerPartManagement;
