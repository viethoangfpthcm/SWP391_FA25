import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";

import LoginForm from "@features/auth/components/LoginForm.jsx";
import Homepage from "@pages/HomePage.jsx";
import About from "@components/shared/AboutUs.jsx";
import ResetPassword from "@features/auth/components/ResetPassword.jsx";
import ProfilePage from "@pages/ProfilePage.jsx";

// Staff
import StaffDashboard from "@features/staff/components/StaffDashboard.jsx";
import StaffCheckList from "@features/checklist/components/StaffCheckList.jsx";

// Technician
import TechnicianTask from "@features/technician/components/Techniciantask.jsx";
import CheckList from "@features/checklist/components/CheckList.jsx";

// Admin
import AdminDashboard from "@features/admin/components/AdminDashboard.jsx";
import ServiceCenterManagement from "@features/admin/components/ServiceCenterManagement.jsx";
import PartManagement from "@features/admin/components/PartManagement.jsx";
import AdminBookingManagement from "@features/admin/components/AdminBookingManagement.jsx";
import AdminPaymentManagement from "@features/admin/components/AdminPaymentManagement.jsx";
import AdminChecklistDetail from "@features/admin/components/AdminChecklistDetail.jsx";
import AdminAnalytics from "@features/admin/components/AdminAnalytics.jsx";

// Customer
import CustomerDashboard from "@features/customer/mainLayout/CustomerDashboard.jsx";
import VehicleMaintenanceSchedule from "@features/customer/scheduletables/VehicleMaintenanceSchedule.jsx";
import Appoint from "@components/shared/Appoint.jsx";
import Report1 from "@features/report/components/report1.jsx";

// Payment
import PaymentResult from "@features/payment/components/PaymentResult.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public routes */}
      <Route path="/home" element={<Homepage />} />
      <Route path="/about" element={<About />} />

      <Route path="/login" element={<LoginForm />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute> 
            <ProfilePage />
          </ProtectedRoute>
        }
      />
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
