import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import './VehicleMaintenanceSchedule.css';

import { FaCalendarAlt, FaTools, FaCheckCircle, FaExclamationTriangle, FaCalendarPlus, FaTimes, FaLock, FaSpinner } from 'react-icons/fa';
import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';
import BookingFormModal from '../components/BookingFormModal.jsx';
import ScheduleItem from '../components/ScheduleItem.jsx';
import ActiveBookings from '../components/ActiveBookings.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { API_BASE_URL } from "@config/api.js";

const BOOKING_STATUS_MAP = {
  PENDING: { text: 'Chờ xử lý', className: 'pending' },
  APPROVED: { text: 'Đã duyệt', className: 'approved' },
  ASSIGNED: { text: 'Đã gán thợ', className: 'assigned' },
  IN_PROGRESS: { text: 'Đang xử lý', className: 'in-progress' },
  COMPLETED: { text: 'Hoàn thành', className: 'completed' },
  PAID: { text: 'Đã thanh toán', className: 'paid' },
  CANCELLED: { text: 'Đã hủy', className: 'cancelled' },
  DECLINED: { text: 'Đã từ chối', className: 'declined' },
  DEFAULT: { text: 'Không rõ', className: 'default' }
};

const getStatusDisplay = (status) => {
  return BOOKING_STATUS_MAP[status] || { text: status || 'Không rõ', className: 'default' };
};
function VehicleMaintenanceSchedule() {
  const { licensePlate } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [nextTimePlanId, setNextTimePlanId] = useState(null);

  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [activeBookings, setActiveBookings] = useState([]);

  // State cho Booking Pop-up
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedPlanForBooking, setSelectedPlanForBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    centerId: '',
    bookingDate: '',
    bookingTime: '',
    note: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // State cho Modal Success (Giữ nguyên)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [successModalAction, setSuccessModalAction] = useState(null);

  // *** THÊM MỚI: State cho Modal Confirm (Hỏi lại) ***
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(null); // Hàm sẽ chạy khi bấm "Xác nhận"

  // Danh sách trung tâm

  const [serviceCenters, setServiceCenters] = useState([]);

  

  // useEffect (Không đổi)
  useEffect(() => {

    const fetchServiceCenters = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/customer/service-centers`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          console.error(`Lỗi khi gọi API: ${response.status}`);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setServiceCenters(data);
        } else {
          console.error("Dữ liệu trả về không đúng định dạng mảng:", data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách trung tâm:", error);
      }
    };

    fetchServiceCenters();

    const fetchScheduleAndBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập.");
        setLoading(false);
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        setSchedule([]);
        setHasActiveBooking(false);
        setActiveBookings([]);

        // --- 1. Fetch Lịch Bảo Dưỡng ---
        const scheduleResponse = await fetch(`${API_BASE_URL}/api/customer/maintenance-schedule?licensePlate=${encodeURIComponent(licensePlate)}`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        });
        if (!scheduleResponse.ok) {
          if (scheduleResponse.status === 401 || scheduleResponse.status === 403) {
            setError("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            navigate("/");
            return;
          } else if (scheduleResponse.status === 404) {
            setError(`Không tìm thấy lịch bảo dưỡng cho xe ${licensePlate}.`);
          } else {
            throw new Error(`Lỗi ${scheduleResponse.status}: Không thể tải lịch bảo dưỡng.`);
          }
        } else {
          const scheduleData = await scheduleResponse.json();
          const validSchedule = Array.isArray(scheduleData) ? scheduleData : [];
          setSchedule(validSchedule);
          setError('');
          const bookableItem = validSchedule.find(item => item.status === 'NEXT_TIME');   

          setNextTimePlanId(bookableItem ? bookableItem.maintenancePlanId : null);
        }

        // --- 2. Fetch Thông tin Booking hiện tại của xe ---
        const bookingsResponse = await fetch(`${API_BASE_URL}/api/customer/bookings/vehicle/${encodeURIComponent(licensePlate)}`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        });
        if (bookingsResponse.ok) {
          const responseData = await bookingsResponse.json();
          if (responseData && typeof responseData === 'object' && 'hasActiveBooking' in responseData && 'currentBookings' in responseData) {
            const hasActive = responseData.hasActiveBooking;
            const activeList = Array.isArray(responseData.currentBookings) ? responseData.currentBookings : [];
            setHasActiveBooking(hasActive);
            setActiveBookings(activeList);
          } else {
            console.warn("Cấu trúc response Booking KHÔNG phải VehicleBookingDTO:", responseData);
            setHasActiveBooking(false);
            setActiveBookings([]);
          }
        } else {
          console.warn("Không thể tải danh sách booking:", bookingsResponse.status);
          setHasActiveBooking(false);
          setActiveBookings([]);
        }
      } catch (err) {
        console.error("Lỗi khi fetch data:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        setSchedule([]);
        setHasActiveBooking(false);
        setActiveBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleAndBookings();
  }, [licensePlate, navigate]);

  // getStatusIcon (Không đổi)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ON_TIME':
        return <FaCheckCircle className="status-icon on-time" title="Đã hoàn thành" />;
      case 'EXPIRED':
        return <FaExclamationTriangle className="status-icon expired" title="Đã bỏ qua" />;
      case 'NEXT_TIME':
        return <FaCalendarAlt className="status-icon next-time" title="Lượt bảo dưỡng tiếp theo" />;
      case 'LOCKED':
        return <FaLock className="status-icon locked" title="Cần hoàn thành lần trước" />;
      case 'OVERDUE':
        return <FaExclamationTriangle className="status-icon overdue" title="Quá hạn bảo dưỡng" />;
      default:
        return <FaTools className="status-icon unknown" title="Chưa xác định" />;
    }
  };

  // getStatusLabel (Không đổi)
  const getStatusLabel = (status) => {
    switch (status) {
      case 'ON_TIME': return 'Đã hoàn thành';
      case 'EXPIRED': return 'Đã bỏ qua';
      case 'NEXT_TIME': return 'Có thể đặt lịch';
      case 'LOCKED': return 'Chưa thể đặt lịch';
      case 'OVERDUE': return 'Đã quá hạn';
      default: return 'Không xác định';
    }
  };

  // handleBookAppointmentClick (Không đổi)
  const handleBookAppointmentClick = (plan) => {
    setError('');
    if (hasActiveBooking) {
      setError("Không thể đặt lịch. Xe này đang có lịch hẹn chờ xử lý hoặc đang bảo dưỡng.");
      return;
    }
    setSelectedPlanForBooking(plan);
    setBookingError('');
    setBookingFormData({ centerId: '', bookingDate: '', bookingTime: '', note: '' });
    setShowBookingForm(true);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = async (e) => {
  e.preventDefault();
  setBookingLoading(true);
  setBookingError('');
  const token = localStorage.getItem("token");

  // --- Kiểm tra các trường bắt buộc ---
  if (!bookingFormData.centerId || !bookingFormData.bookingDate || !bookingFormData.bookingTime) {
    setBookingError("Vui lòng chọn trung tâm, ngày và giờ hẹn.");
    setBookingLoading(false);
    return;
  }

  // --- Lấy thông tin trung tâm được chọn ---
  const selectedCenter = serviceCenters.find(
    (c) => c.id === parseInt(bookingFormData.centerId)
  );

  if (!selectedCenter) {
    setBookingError("Không tìm thấy trung tâm dịch vụ đã chọn.");
    setBookingLoading(false);
    return;
  }

  // --- Kiểm tra giờ hẹn hợp lệ so với giờ mở cửa/đóng cửa ---
  try {
    const bookingDateTime = new Date(`${bookingFormData.bookingDate}T${bookingFormData.bookingTime}:00`);
    const [openH, openM] = selectedCenter.openingHour.split(":").map(Number);
    const [closeH, closeM] = selectedCenter.closingHour.split(":").map(Number);

    const openTime = new Date(bookingDateTime);
    const closeTime = new Date(bookingDateTime);
    openTime.setHours(openH, openM, 0);
    closeTime.setHours(closeH, closeM, 0);

    if (bookingDateTime < openTime || bookingDateTime > closeTime) {
      setBookingError(
        `Giờ hẹn phải nằm trong khoảng ${selectedCenter.openingHour} - ${selectedCenter.closingHour} (${selectedCenter.name}).`
      );
      setBookingLoading(false);
      return;
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra thời gian:", err);
    setBookingError("Không thể kiểm tra giờ hẹn. Vui lòng thử lại.");
    setBookingLoading(false);
    return;
  }

  // --- Nếu hợp lệ, gửi API đặt lịch ---
  try {
    const bookingDateTime = `${bookingFormData.bookingDate}T${bookingFormData.bookingTime}:00`;
    const payload = {
      vehiclePlate: licensePlate,
      centerId: parseInt(bookingFormData.centerId),
      bookingDate: bookingDateTime,
      maintenancePlanId: selectedPlanForBooking.maintenancePlanId,
      note: bookingFormData.note,
    };

    const response = await fetch(`${API_BASE_URL}/api/customer/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Không thể đặt lịch (Lỗi xác thực)");
      }
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(
          errorJson.message || errorJson.error || `Lỗi ${response.status}: ${errorText}`
        );
      } catch (parseError) {
        throw new Error(`Lỗi ${response.status}: ${errorText}`);
      }
    }

    // --- Thành công ---
    setShowBookingForm(false);
    setSuccessModalMessage(
      "Đặt lịch thành công! Chúng tôi sẽ sớm liên hệ với bạn để xác nhận."
    );
    setSuccessModalAction(() => () => navigate("/customer/dashboard"));
    setShowSuccessModal(true);
  } catch (err) {
    console.error("Lỗi khi đặt lịch:", err);
    setBookingError(err.message || "Đã xảy ra lỗi khi đặt lịch.");
  } finally {
    setBookingLoading(false);
  }
};

  const handleCancelBookingClick = (bookingId) => {
    setConfirmModalMessage("Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.");

    setOnConfirmAction(() => () => executeCancelBooking(bookingId));
    setShowConfirmModal(true); // Mở modal hỏi
  };

  // Bước 2: Hàm này chứa logic, được gọi bởi nút "Xác nhận" trên modal
  const executeCancelBooking = async (bookingId) => {
    setBookingLoading(true);
    setError('');
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Lỗi ${response.status}`);
        } catch (parseError) {
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }

      // Cập nhật lại UI
      const updatedActiveBookings = activeBookings.filter(b => b.bookingId !== bookingId);
      setActiveBookings(updatedActiveBookings);
      if (updatedActiveBookings.length === 0) {
        setHasActiveBooking(false);
      }

      // Mở modal success
      setSuccessModalMessage("Đã hủy lịch hẹn thành công.");
      setSuccessModalAction(null);
      setShowSuccessModal(true);

    } catch (err) {
      console.error("Lỗi khi hủy lịch:", err);
      setError(err.message || "Đã xảy ra lỗi khi hủy lịch hẹn.");
    } finally {
      setBookingLoading(false);
      // Quan trọng: Đóng modal confirm lại
      setShowConfirmModal(false);
    }
  };
  // *** KẾT THÚC SỬA ***

  if (loading) {
    return (
      <div className="schedule-page loading-container">
        <Navbar />
        <div className="loading-container">
          <Loading inline />
          Đang tải lịch bảo dưỡng...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <Navbar />
      <main className="schedule-content">
        <h1>Lịch trình bảo dưỡng cho xe {licensePlate}</h1>

        {/* --- Phần hiển thị booking active --- */}
        <ActiveBookings bookings={activeBookings} onCancel={handleCancelBookingClick} loading={bookingLoading} />

        {error && <p className="error-message centered">{error}</p>}

        {/* --- Modal Form Đặt Lịch (Không thay đổi) --- */}
        <BookingFormModal
          visible={showBookingForm}
          selectedPlan={selectedPlanForBooking}
          formData={bookingFormData}
          onChange={handleBookingFormChange}
          onConfirm={handleConfirmBooking}
          centers={serviceCenters}
          loading={bookingLoading}
          error={bookingError}
          onClose={() => setShowBookingForm(false)}
          licensePlate={licensePlate}
        />

        {/* --- Modal Success (Không thay đổi) --- */}
        <SuccessModal visible={showSuccessModal} message={successModalMessage} onClose={() => setShowSuccessModal(false)} onAction={successModalAction} />

        {/* *** THÊM MỚI: Modal Confirm (Hỏi lại) *** */}
        <ConfirmModal
          visible={showConfirmModal}
          message={confirmModalMessage}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => { if (onConfirmAction) onConfirmAction(); }}
          loading={bookingLoading}
        />
        {/* --- Kết thúc Modal Confirm --- */}

        {/* --- Danh sách lịch bảo dưỡng (Không thay đổi) --- */}
        {schedule.length > 0 ? (
          <div className="schedule-list">
            {schedule.map(item => (
              <ScheduleItem key={item.maintenancePlanId} item={item} nextTimePlanId={nextTimePlanId} hasActiveBooking={hasActiveBooking} onBookClick={handleBookAppointmentClick} />
            ))}
          </div>
        ) : (
          !error && !loading && <p className="no-data">Không có lịch trình bảo dưỡng nào cho xe này.</p>
        )}
        <Button onClick={() => navigate(-1)} className="back-button">Quay lại Dashboard</Button>
      </main>
      <Footer />
    </div>
  );
}

export default VehicleMaintenanceSchedule;