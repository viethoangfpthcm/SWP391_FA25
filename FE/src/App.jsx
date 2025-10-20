import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "./components/Loading.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// import các trang
import LoginForm from "./page/login/LoginForm.jsx";
import CheckList from "./page/checkList/CheckList.jsx";
import TechnicanTask from "./page/technican/technicantask.jsx";
import Report1 from "./page/report/report1.jsx";
import Report3 from "./page/report/report3.jsx";
import Homepage from "./page/home/Homepage.jsx";
import Appoint from "./page/home/Appoint.jsx";
import About from "./page/home/AboutUs.jsx";
import Contact from "./page/home/Contact.jsx";
import StaffDashboard from "./page/staff/StaffDashboard.jsx";
import PaymentReady from "./page/payment/PaymentReady.jsx";
import PaymentProcess from "./page/payment/PaymentProcess.jsx";
import CustomerDashboard from "./page/customer/CustomerDashboard.jsx";
import VehicleMaintenanceSchedule from "./page/customer/VehicleMaintenanceSchedule.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  const isLoggedIn = localStorage.getItem("token");

  return (
    <>
      {loading && <Loading />}

      <Routes>
        {/* Trang mặc định */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Trang công khai */}
        <Route path="/home" element={<Homepage />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <LoginForm />
          }
        />

        {/* Các trang chỉ dành cho người đăng nhập */}
        <Route
          path="/checklist"
          element={
            <ProtectedRoute>
              <CheckList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician-task"
          element={
            <ProtectedRoute>
              <TechnicanTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report3"
          element={
            <ProtectedRoute>
              <Report3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appoint"
          element={
            <ProtectedRoute>
              <Appoint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/schedule"
          element={
            <ProtectedRoute>
              <VehicleMaintenanceSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/ready"
          element={
            <ProtectedRoute>
              <PaymentReady />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/process/:id"
          element={
            <ProtectedRoute>
              <PaymentProcess />
            </ProtectedRoute>
          }
        />

        {/* Route sai → về home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

export default App;
