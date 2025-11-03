import React from "react";
import Sidebar from "../../page/sidebar/sidebar.jsx";

export default function StaffLayout({ userInfo, children }) {
  return (
    <div className="dashboard-container">
      <Sidebar
        sidebarOpen={true}
        userName={userInfo?.fullName}
        userRole={userInfo?.role}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
