import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginForm from "./page/login/LoginForm.jsx";
import Homepage from "./page/home/Homepage.jsx";
import About from "./page/home/AboutUs.jsx";
import Contact from "./page/home/Contact.jsx";

// Staff
import StaffDashboard from "./page/staff/StaffDashboard.jsx";
import StaffCheckList from "./page/checkList/StaffCheckList.jsx";

// Admin
import AdminDashboard from "./page/admin/Admindashboard.jsx";

// Customer
import CustomerDashboard from "./page/customer/CustomerDashboard.jsx";
import VehicleMaintenanceSchedule from "./page/customer/VehicleMaintenanceSchedule.jsx";
import Appoint from "./page/home/Appoint.jsx";

// Payment
import PaymentReady from "./page/payment/PaymentReady.jsx";
import PaymentProcess from "./page/payment/PaymentProcess.jsx";
import PaymentResult from "./page/payment/PaymentResult.jsx";

function App() {
  return (
    <Routes>
      {/* Redirect root "/" về "/home" */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public routes */}
      <Route path="/home" element={<Homepage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<LoginForm />} />

      {/* Staff routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredRole="STAFF">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/checklist/:bookingId"
        element={
          <ProtectedRoute requiredRole="STAFF">
            <StaffCheckList />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appoint"
        element={
          <ProtectedRoute requiredRole="CUSTOMER"> {}
            <Appoint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/vehicle-schedule/:licensePlate"
        element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <VehicleMaintenanceSchedule />
          </ProtectedRoute>
        }
      />

      {/* Payment routes */}
      <Route
        path="/payment/result"
        element={
          <ProtectedRoute>
            <PaymentResult />
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
    </Routes>
  );
}

export default App;
