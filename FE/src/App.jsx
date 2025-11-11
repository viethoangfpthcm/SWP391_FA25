import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";

import LoginForm from "@features/auth/LoginForm.jsx";
import Homepage from "@pages/HomePage.jsx";
import About from "@components/shared/AboutUs.jsx";
import ResetPassword from "@features/auth/ResetPassword.jsx";
import ProfilePage from "@pages/ProfilePage.jsx";

// Staff
import StaffDashboard from "@features/staff/StaffDashboard.jsx";
import StaffCheckList from "@features/checklist/StaffCheckList.jsx";
import StaffAnalytics from "@features/staff/StaffAnalytics.jsx";
import StaffPartsView from "@features/staff/StaffPartsView.jsx";

// Technician
import TechnicianTask from "@features/technician/TechnicianTask.jsx";
import CheckList from "@features/checklist/CheckList.jsx";

// Admin
import AdminDashboard from "@features/admin/AdminDashboard.jsx";
import ServiceCenterManagement from "@features/admin/ServiceCenterManagement.jsx";
import PartManagement from "@features/admin/PartManagement.jsx";
import AdminBookingManagement from "@features/admin/AdminBookingManagement.jsx";
import AdminPaymentManagement from "@features/admin/AdminPaymentManagement.jsx";
import AdminChecklistDetail from "@features/admin/AdminChecklistDetail.jsx";
import AdminAnalytics from "@features/admin/AdminAnalytics.jsx";
import AdminUpdate from "@features/admin/AdminScheduleManagement.jsx";

// Manager
import ManagerDashboard from "@features/manager/ManagerDashboard.jsx";
import ManagerPartManagement from "@features/manager/PartManagement.jsx";
import ManagerBookingManagement from "@features/manager/BookingManagement.jsx";
import ManagerPaymentManagement from "@features/manager/PaymentManagement.jsx";
import ManagerAnalytics from "@features/manager/ManagerAnalytics.jsx";

// Customer
import CustomerDashboard from "@features/customer/CustomerDashboard.jsx";
import VehicleMaintenanceSchedule from "@features/customer/shared/VehicleMaintenanceSchedule.jsx";
import Appoint from "@components/shared/Appoint.jsx";
import Report1 from "@features/report/report1.jsx";

// Payment
import PaymentResult from "@features/payment/PaymentResult.jsx";
import AdminScheduleManagement from "./features/admin/AdminScheduleManagement";

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
      <Route
        path="/staff/analytics"
        element={
          <ProtectedRoute requiredRole="STAFF">
            <StaffAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/parts"
        element={
          <ProtectedRoute requiredRole="STAFF">
            <StaffPartsView />
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
 <Route
        path="/admin/update"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminScheduleManagement />
          </ProtectedRoute>
        }
      />
      {/* Manager */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/parts"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerPartManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/bookings"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerBookingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/payments"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerPaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/analytics"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerAnalytics />
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
