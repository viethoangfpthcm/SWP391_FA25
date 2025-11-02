import React, { useEffect, useState } from "react";
import "./ManagerChecklistDetail.css";
import { useParams } from "react-router-dom";

const ManagerChecklistDetail = () => {
  const { bookingId } = useParams();
  const [checklist, setChecklist] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`/api/manager/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setChecklist)
      .catch(console.error);
  }, [bookingId]);

  return (
    <div className="manager-checklist-detail">
      <h2>Chi tiết checklist đặt lịch #{bookingId}</h2>
      <ul>
        {checklist.map((item) => (
          <li key={item.id}>
            {item.taskName} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagerChecklistDetail;
