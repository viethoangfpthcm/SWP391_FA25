import React from "react";

export default function TechnicianHeader({ userInfo }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-text">
          <h1>EV SERVICE</h1>
          <p>Technician Management System</p>
        </div>
      </div>
      <div className="header-right">
        <span className="technician-name">{userInfo.fullName}</span>
      </div>
    </header>
  );
}
