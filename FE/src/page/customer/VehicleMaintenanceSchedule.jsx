import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './VehicleMaintenanceSchedule.css';

import { FaCalendarAlt, FaTools, FaCheckCircle, FaExclamationTriangle, FaCalendarPlus, FaTimes, FaLock, FaSpinner } from 'react-icons/fa';

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
  const [serviceCenters] = useState([
    { id: 1, name: "EV Center 1", address: "25 Nguyễn Huệ, Quận 1, TP.HCM", phone: "0787052810" },
    { id: 2, name: "EV Center 2", address: "12 Võ Văn Ngân, Thủ Đức, TP.HCM", phone: "0787052811" },
    { id: 3, name: "EV Center 3", address: "200 Nguyễn Văn Cừ, Quận 5, TP.HCM", phone: "0787052812" },
  ]);

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";

  // useEffect (Không đổi)
  useEffect(() => {
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
        const scheduleResponse = await fetch(`${API_BASE}/api/customer/maintenance-schedule?licensePlate=${encodeURIComponent(licensePlate)}`, {
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
          const bookableItem = validSchedule.find(item => item.status === 'OVERDUE') ||
            validSchedule.find(item => item.status === 'NEXT_TIME');

          setNextTimePlanId(bookableItem ? bookableItem.maintenancePlanId : null);
        }

        // --- 2. Fetch Thông tin Booking hiện tại của xe ---
        const bookingsResponse = await fetch(`${API_BASE}/api/customer/bookings/vehicle/${encodeURIComponent(licensePlate)}`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
        });
        if (bookingsResponse.ok) {
          const responseData = await bookingsResponse.json();
          console.log("📋 Response VehicleBookingDTO:", responseData);
          if (responseData && typeof responseData === 'object' && 'hasActiveBooking' in responseData && 'currentBookings' in responseData) {
            const hasActive = responseData.hasActiveBooking;
            const activeList = Array.isArray(responseData.currentBookings) ? responseData.currentBookings : [];
            setHasActiveBooking(hasActive);
            setActiveBookings(activeList);
            console.log("Active Bookings List (từ DTO):", activeList);
            console.log("Has Active Booking Flag (từ DTO):", hasActive);
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
  }, [licensePlate, navigate, API_BASE]);

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

  // handleBookingFormChange (Không đổi)
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({ ...prev, [name]: value }));
  };

  // handleConfirmBooking (Không đổi, đã sửa ở lần trước)
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    const token = localStorage.getItem("token");

    if (!bookingFormData.centerId || !bookingFormData.bookingDate || !bookingFormData.bookingTime) {
      setBookingError("Vui lòng chọn trung tâm, ngày và giờ hẹn.");
      setBookingLoading(false);
      return;
    }

    try {
      const bookingDateTime = `${bookingFormData.bookingDate}T${bookingFormData.bookingTime}:00`;
      const payload = {
        vehiclePlate: licensePlate,
        centerId: parseInt(bookingFormData.centerId),
        bookingDate: bookingDateTime,
        maintenancePlanId: selectedPlanForBooking.maintenancePlanId,
        note: bookingFormData.note
      };
      const response = await fetch(`${API_BASE}/api/customer/bookings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
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
          throw new Error(errorJson.message || errorJson.error || `Lỗi ${response.status}: ${errorText}`);
        } catch (parseError) {
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }

      setShowBookingForm(false);
      // Mở modal success
      setSuccessModalMessage("Đặt lịch thành công! Chúng tôi sẽ sớm liên hệ với bạn để xác nhận.");
      setSuccessModalAction(() => () => navigate('/customer/dashboard'));
      setShowSuccessModal(true);

    } catch (err) {
      console.error("Lỗi khi đặt lịch:", err);
      setBookingError(err.message || "Đã xảy ra lỗi khi đặt lịch.");
    } finally {
      setBookingLoading(false);
    }
  };


  // *** SỬA LẠI: TÁCH HÀM HỦY LÀM 2 BƯỚC ***

  // Bước 1: Hàm này được gọi bởi nút "Hủy lịch hẹn"
  const handleCancelBookingClick = (bookingId) => {
    setConfirmModalMessage("Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.");
    // Gán hàm "executeCancelBooking" cho nút Xác nhận
    // Dùng () => () => ... để nó không tự chạy
    setOnConfirmAction(() => () => executeCancelBooking(bookingId));
    setShowConfirmModal(true); // Mở modal hỏi
  };

  // Bước 2: Hàm này chứa logic, được gọi bởi nút "Xác nhận" trên modal
  const executeCancelBooking = async (bookingId) => {
    setBookingLoading(true);
    setError('');
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/api/customer/bookings/${bookingId}/cancel`, {
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
          <FaSpinner className="spinner-icon" />
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
        {activeBookings.length > 0 && (
          <div className="active-bookings-section">
            <h2>Lịch hẹn đang xử lý</h2>
            {activeBookings.map(booking => (
              <div key={booking.bookingId} className={`active-booking-item status-${booking.status?.toLowerCase()}`}>
                <p><strong>Trung tâm:</strong> {booking.centerName}</p>
                <p><strong>Địa chỉ:</strong> {booking.centerAddress}</p>
                <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> {booking.status}</p>
                {booking.status === 'Pending' && (
                  <button
                    // *** SỬA LẠI: Gọi hàm mở modal ***
                    onClick={() => handleCancelBookingClick(booking.bookingId)}
                    className="btn-cancel"
                    disabled={bookingLoading}
                  >
                    <FaTimes /> Hủy lịch hẹn
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="error-message centered">{error}</p>}

        {/* --- Modal Form Đặt Lịch (Không thay đổi) --- */}
        {showBookingForm && selectedPlanForBooking && (
          <div className="modal-overlay">
            <div className="modal-content booking-form-modal">
              <div className="modal-header">
                <h2>Đặt lịch cho: {selectedPlanForBooking.planName}</h2>
                <button onClick={() => setShowBookingForm(false)} className="close-modal-btn"> <FaTimes /> </button>
              </div>
              <form onSubmit={handleConfirmBooking}>
                {bookingError && <p className="error-message">{bookingError}</p>}
                <p className="booking-info">Xe: <strong>{licensePlate}</strong></p>
                <p className="booking-info">Gói: <strong>{selectedPlanForBooking.planName}</strong> ({selectedPlanForBooking.intervalKm?.toLocaleString()} km)</p>
                <div className="form-group">
                  <label htmlFor="centerId">Chọn trung tâm *</label>
                  <select id="centerId" name="centerId" value={bookingFormData.centerId} onChange={handleBookingFormChange} required>
                    <option value="" disabled>-- Chọn trung tâm dịch vụ --</option>
                    {serviceCenters.map(center => (
                      <option key={center.id} value={center.id}> {center.name} - {center.address} </option>
                    ))}
                  </select>
                </div>
                <div className="form-group inline-group">
                  <div>
                    <label htmlFor="bookingDate">Chọn ngày *</label>
                    <input type="date" id="bookingDate" name="bookingDate" value={bookingFormData.bookingDate} onChange={handleBookingFormChange} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label htmlFor="bookingTime">Chọn giờ *</label>
                    <input type="time" id="bookingTime" name="bookingTime" value={bookingFormData.bookingTime} onChange={handleBookingFormChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="note">Ghi chú (Tùy chọn)</label>
                  <input type="text" id="note" name="note" value={bookingFormData.note} onChange={handleBookingFormChange} placeholder="Yêu cầu thêm (nếu có)..." />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowBookingForm(false)} className="btn-cancel" disabled={bookingLoading}>Hủy</button>
                  <button type="submit" className="btn-save" disabled={bookingLoading}>
                    {bookingLoading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Modal Success (Không thay đổi) --- */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content success-modal">
              <div className="success-modal-body">
                <FaCheckCircle className="success-icon" />
                <p>{successModalMessage}</p>
              </div>
              <div className="form-actions">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (successModalAction) {
                      successModalAction();
                    }
                  }}
                  className="btn-save"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* *** THÊM MỚI: Modal Confirm (Hỏi lại) *** */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content confirm-modal">
              <div className="confirm-modal-body">
                <FaExclamationTriangle className="confirm-icon" />
                <h3>Xác nhận hành động</h3>
                <p>{confirmModalMessage}</p>
              </div>
              <div className="form-actions">
                {/* Nút Hủy (dùng class .btn-cancel của form) */}
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-cancel"
                  disabled={bookingLoading}
                >
                  Hủy bỏ
                </button>
                {/* Nút Xác nhận (dùng class mới .btn-confirm-danger) */}
                <button
                  onClick={() => {
                    if (onConfirmAction) {
                      onConfirmAction(); // Chạy hàm 'executeCancelBooking'
                    }
                  }}
                  className="btn-confirm-danger"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- Kết thúc Modal Confirm --- */}


        {/* --- Danh sách lịch bảo dưỡng (Không thay đổi) --- */}
        {schedule.length > 0 ? (
          <div className="schedule-list">
            {schedule.map((item) => (
              <div key={item.maintenancePlanId} className={`schedule-item status-${item.status?.toLowerCase()}`}>
                <div className="schedule-item-header">
                  <h3>{item.planName}</h3>
                  <div className="status-container">
                    {getStatusIcon(item.status)}
                    <span className="status-label">{getStatusLabel(item.status)}</span>
                  </div>
                </div>
                <p className="description">{item.description || 'Không có mô tả chi tiết.'}</p>
                <p><strong>Mốc KM:</strong> {item.intervalKm?.toLocaleString()} km</p>
                {item.planDate && (
                  <p><strong>Ngày dự kiến:</strong> {new Date(item.planDate).toLocaleDateString('vi-VN')}</p>
                )}
                {item.deadline && (
                  <p><strong>Hạn chót:</strong> {new Date(item.deadline).toLocaleDateString('vi-VN')}</p>
                )}

                {item.status === 'EXPIRED' && (
                  <p className="expired-info">
                    <FaExclamationTriangle /> Lần bảo dưỡng này đã bị bỏ qua
                  </p>
                )}
                {item.status === 'LOCKED' && (
                  <p className="locked-message">
                    <FaLock /> Cần hoàn thành lần bảo dưỡng kế tiếp trước
                  </p>
                )}
                {item.status === 'OVERDUE' && (
                  <p className="overdue-info">
                    <FaExclamationTriangle /> Lịch bảo dưỡng này đã quá hạn! Vui lòng đặt lịch sớm nhất có thể.
                  </p>
                )}
                {(item.status === 'NEXT_TIME' || item.status === 'OVERDUE') && item.maintenancePlanId === nextTimePlanId && (
                  hasActiveBooking ? (
                    <p className="locked-message" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      <FaCalendarAlt style={{ marginRight: '8px' }} />
                      Xe này đã có lịch hẹn (Chờ xử lý hoặc chưa thanh toán).
                    </p>
                  ) : (
                    <button
                      className="book-now-button"
                      onClick={() => handleBookAppointmentClick(item)}
                    >
                      <FaCalendarPlus /> Đặt lịch ngay
                    </button>
                  )
                )}
                {item.status === 'ON_TIME' && (
                  <div className="completed-badge">
                    <FaCheckCircle /> Đã hoàn thành
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !error && !loading && <p className="no-data">Không có lịch trình bảo dưỡng nào cho xe này.</p>
        )}
        <button onClick={() => navigate(-1)} className="back-button">Quay lại Dashboard</button>
      </main>
      <Footer />
    </div>
  );
}

export default VehicleMaintenanceSchedule;