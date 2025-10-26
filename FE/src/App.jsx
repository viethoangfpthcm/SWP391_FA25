import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginForm from "./page/login/LoginForm.jsx";
import Homepage from "./page/home/Homepage.jsx";
import About from "./page/home/AboutUs.jsx";
import Contact from "./page/home/Contact.jsx";
import ResetPassword from "./page/login/ResetPassword.jsx";

// Staff
import StaffDashboard from "./page/staff/StaffDashboard.jsx";
import StaffCheckList from "./page/checkList/StaffCheckList.jsx";

// Technician
import TechnicianTask from "./page/technican/technicantask.jsx";
import CheckList from "./page/checkList/CheckList.jsx";

// Admin
import AdminDashboard from "./page/admin/AdminDashboard.jsx";
import ServiceCenterManagement from "./page/admin/ServiceCenterManagement.jsx";
import PartManagement from "./page/admin/PartManagement.jsx";
import AdminBookingManagement from "./page/admin/AdminBookingManagement.jsx";
import AdminPaymentManagement from "./page/admin/AdminPaymentManagement.jsx";
import AdminChecklistDetail from "./page/admin/AdminChecklistDetail.jsx";
import AdminAnalytics from "./page/admin/AdminAnalytics.jsx";

// Customer
import CustomerDashboard from "./page/customer/CustomerDashboard.jsx";
import VehicleMaintenanceSchedule from "./page/customer/VehicleMaintenanceSchedule.jsx";
import Appoint from "./page/home/Appoint.jsx";
import Report1 from "./page/report/report1.jsx";

// Payment
import PaymentResult from "./page/payment/PaymentResult.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public routes */}
      <Route path="/home" element={<Homepage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<LoginForm />} />
    <Route path="/reset-password" element={<ResetPassword />} />
      {/* Staff */}
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

      {/* Technician*/}
      <Route
        path="/technicantask"
        element={
          <ProtectedRoute requiredRole="TECHNICIAN">
            <TechnicianTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checklist"
        element={
          <ProtectedRoute requiredRole="TECHNICIAN">
            <CheckList />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/service-centers"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ServiceCenterManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parts/:centerId"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <PartManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminBookingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/checklist/booking/:bookingId"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminChecklistDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />


      {/* Customer */}
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
          <ProtectedRoute requiredRole="CUSTOMER">
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

      {/* Payment */}
      <Route
        path="/payment/result"
        element={
          <ProtectedRoute>
            <PaymentResult />
          </ProtectedRoute>
        }
      />

      {/* Report */}
      <Route
        path="/report1"
        element={
          <ProtectedRoute requiredRole="CUSTOMER">
            <Report1 />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
