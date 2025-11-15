import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "@config/api.js";
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import { FaUser, FaCar, FaCalendarAlt, FaPlus, FaTimes, FaEdit, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaStar } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import './CustomerDashboard.css';
import AddVehicleModal from './components/AddVehicleModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';
import SuccessModal from './components/SuccessModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import VehicleCard from './components/VehicleCard.jsx';
import ProfileSection from './components/ProfileSection.jsx';
import VehicleSection from './components/VehicleSection.jsx';
import StatsGrid from './components/StatsGrid.jsx';
import BookingList from './components/BookingList.jsx';
import useCustomerDashboard from './hooks/useCustomerDashboard.js';


const BOOKING_STATUS_MAP = {
  PENDING: { text: 'Chờ xử lý', className: 'pending' },
  APPROVED: { text: 'Đã duyệt', className: 'approved' },
  ASSIGNED: { text: 'Đã gán thợ', className: 'assigned' },
  IN_PROGRESS: { text: 'Đang xử lý', className: 'in_progress' },
  COMPLETED: { text: 'Hoàn thành', className: 'completed' },
  PAID: { text: 'Đã thanh toán', className: 'paid' },
  CANCELLED: { text: 'Đã hủy', className: 'cancelled' },
  DECLINED: { text: 'Đã từ chối', className: 'declined' },
  DEFAULT: { text: 'Không rõ', className: 'default' }
};
const getStatusDisplay = (status) => {
  return BOOKING_STATUS_MAP[status] || { text: status, className: 'default' };
};
function CustomerDashboard() {
  const hook = useCustomerDashboard();
  const {
    dashboardData,
    bookings,
    loading,
    error,
    showAddVehicleForm,
    newVehicleData,
    addVehicleLoading,
    addVehicleError,
    showProfileModal,
    profileData,
    profileLoading,
    profileError,
    showSuccessModal,
    successModalMessage,
    successModalAction,
    showConfirmModal,
    confirmModalMessage,
    onConfirmAction,
    cancelBookingLoading,
    showFeedbackModal,
    feedbackLoading,
    feedbackError,
    feedbackData,
    vehicleModels,
    loadingModels,
    // actions
    handleAddVehicleClick,
    handleNewVehicleChange,
    handleSaveNewVehicle,
    handleEditProfileClick,
    handleProfileChange,
    handleUpdateProfile,
    handleDeleteVehicleClick,
    handleCancelBookingClick,
    handleFeedbackClick,
    handleFeedbackChange,
    handleRatingChange,
    handleSubmitFeedback,
    setShowAddVehicleForm,
    setShowProfileModal,
    setShowSuccessModal,
    setShowFeedbackModal,
    setShowConfirmModal,
    setOnConfirmAction,
    setSuccessModalAction,
    setConfirmModalMessage,
  } = hook;

  const navigate = useNavigate();
  const handleViewSchedule = (licensePlate) => navigate(`/customer/vehicle-schedule/${licensePlate}`);



  if (loading && !dashboardData) {
    return (
      <div className="dashboard-page loading-container">
        <Navbar />
        <div className="loading-container">
          <Loading inline />
          Đang tải dữ liệu...
        </div>
        <Footer />
      </div>
    );
  }
  if (error && !dashboardData) {
    return (
      <div className="dashboard-page error-container">
        <Navbar />
        <p className="error-message">Lỗi: {error}</p>
        <Footer />
      </div>
    );
  }
  if (!dashboardData) {
    return (
      <div className="dashboard-page empty-container">
        <Navbar />
        <p>Không có dữ liệu để hiển thị. Vui lòng thử lại sau.</p>
        <Footer />
      </div>
    );
  }

  const { customerInfo, vehicles } = dashboardData || {};
  const calculatedStats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
    assignedBookings: bookings.filter(b => b.status === 'ASSIGNED').length,
    inProgressBookings: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
    paidBookings: bookings.filter(b => b.status === 'PAID').length,
    lastBookingDate: bookings.length > 0
      ? bookings.reduce((latest, current) => {
        const latestDate = new Date(latest.bookingDate);
        const currentDate = new Date(current.bookingDate);
        return currentDate > latestDate ? current : latest;
      }).bookingDate
      : null
  };
  const activeStatuses = ['PENDING', 'IN_PROGRESS'];  // 🔥 CHỈ 2 CÁI NÀY
  const activeBookings = bookings
    .filter(b => activeStatuses.includes(b.status))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
  const historyStatuses = ['COMPLETED', 'PAID', 'CANCELLED', 'DECLINED'];
  const bookingHistory = bookings.filter(b => historyStatuses.includes(b.status))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));


  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-content">
        <h1>Bảng điều khiển khách hàng</h1>


        <AddVehicleModal
          visible={showAddVehicleForm}
          onClose={() => setShowAddVehicleForm(false)}
          newVehicleData={newVehicleData}
          onChange={handleNewVehicleChange}
          onSave={handleSaveNewVehicle}
          loading={addVehicleLoading}
          error={addVehicleError}
          vehicleModels={vehicleModels}
          loadingModels={loadingModels}
        />


        <ProfileModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profileData={profileData}
          onChange={handleProfileChange}
          onSave={handleUpdateProfile}
          loading={profileLoading}
          error={profileError}
        />


        <SuccessModal visible={showSuccessModal} message={successModalMessage} onClose={() => setShowSuccessModal(false)} onAction={successModalAction} />
        <ConfirmModal
          visible={showConfirmModal}
          message={confirmModalMessage}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => { if (onConfirmAction) onConfirmAction(); }}
          loading={cancelBookingLoading}
        />
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          data={feedbackData}
          onChange={handleFeedbackChange}
          onRatingChange={handleRatingChange}
          onSubmit={handleSubmitFeedback}
          loading={feedbackLoading}
          error={feedbackError}
        />


        <ProfileSection customerInfo={customerInfo} onEdit={handleEditProfileClick} />

        <hr className="section-divider" />

        <VehicleSection vehicles={vehicles} onAddClick={handleAddVehicleClick} onViewSchedule={handleViewSchedule} onDelete={handleDeleteVehicleClick} />

        <hr className="section-divider" />

        <section className="dashboard-section booking-stats-section">
          <h2><FaCalendarAlt /> Lịch sử & Thống kê Lịch hẹn</h2>
          <StatsGrid stats={calculatedStats} />
          <BookingList title="Lịch hẹn đang xử lý" bookings={activeBookings} loading={loading} getStatusDisplay={getStatusDisplay} onCancel={handleCancelBookingClick} mode="processing" />
          <BookingList title="Lịch sử hẹn" bookings={bookingHistory} loading={loading} getStatusDisplay={getStatusDisplay} onFeedback={handleFeedbackClick} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default CustomerDashboard;