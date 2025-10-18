import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './VehicleMaintenanceSchedule.css';
import { FaCalendarAlt, FaTools, FaCheckCircle, FaExclamationTriangle, FaCalendarPlus, FaTimes } from 'react-icons/fa';

function VehicleMaintenanceSchedule() {
  const { licensePlate } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [firstNextTimePlanId, setFirstNextTimePlanId] = useState(null);

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

  // Danh sách trung tâm
  const [serviceCenters] = useState([
    { id: 1, name: "EV Center 1", address: "25 Nguyễn Huệ, Quận 1, TP.HCM", phone: "0787052810" },
    { id: 2, name: "EV Center 2", address: "12 Võ Văn Ngân, Thủ Đức, TP.HCM", phone: "0787052811" },
    { id: 3, name: "EV Center 3", address: "200 Nguyễn Văn Cừ, Quận 5, TP.HCM", phone: "0787052812" },
  ]);

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";

  useEffect(() => {
    const fetchSchedule = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập.");
        setLoading(false);
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const scheduleResponse = await fetch(`${API_BASE}/api/customer/maintenance-schedule?licensePlate=${encodeURIComponent(licensePlate)}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!scheduleResponse.ok) {
           if (scheduleResponse.status === 401 || scheduleResponse.status === 403) {
              setError("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("role");
              navigate("/");
           } else if (scheduleResponse.status === 404) {
             setError(`Không tìm thấy lịch bảo dưỡng cho xe ${licensePlate}.`);
           } else {
              throw new Error(`Lỗi ${scheduleResponse.status}: Không thể tải lịch bảo dưỡng.`);
           }
           setSchedule([]);
           return;
        }

        const scheduleData = await scheduleResponse.json();
        const validSchedule = Array.isArray(scheduleData) ? scheduleData : [];
        setSchedule(validSchedule);
        setError('');
        const firstNextTime = validSchedule.find(item => item.status === 'NEXT_TIME');
        setFirstNextTimePlanId(firstNextTime ? firstNextTime.maintenancePlanId : null);

      } catch (err) {
        console.error("Lỗi khi fetch maintenance schedule:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [licensePlate, navigate, API_BASE]);

  // ++ Sửa hàm getStatusIcon: Thêm lại phần thân hàm ++
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ON_TIME':
        return <FaCheckCircle className="status-icon on-time" title="Đã hoàn thành" />;
      case 'EXPIRED':
        return <FaExclamationTriangle className="status-icon expired" title="Quá hạn" />;
      case 'NEXT_TIME':
        return <FaCalendarAlt className="status-icon next-time" title="Lượt bảo dưỡng tiếp theo" />;
      default:
        return <FaTools className="status-icon unknown" title="Chưa xác định" />;
    }
  };
  // ++ Kết thúc sửa getStatusIcon ++

  const handleBookAppointmentClick = (plan) => {
    setSelectedPlanForBooking(plan);
    setBookingError('');
    setBookingFormData({
        centerId: '',
        bookingDate: '',
        bookingTime: '',
        note: ''
    });
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
         const errorText = await response.text();
          try {
              const errorJson = JSON.parse(errorText);
              throw new Error(errorJson.message || errorJson.error || `Lỗi ${response.status}: ${errorText}`);
          } catch (parseError) {
              throw new Error(`Lỗi ${response.status}: ${errorText}`);
          }
       }

      setShowBookingForm(false);
      alert("Đặt lịch thành công!");
      navigate('/customer/dashboard');

    } catch (err) {
      console.error("Lỗi khi đặt lịch:", err);
      setBookingError(err.message || "Đã xảy ra lỗi khi đặt lịch.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ++ Sửa if(loading): Thêm lại phần thân hàm ++
   if (loading) {
     return (
       <div className="schedule-page loading-container">
         <Navbar />
         <p>Đang tải lịch bảo dưỡng...</p>
         <Footer />
       </div>
     );
   }
  // ++ Kết thúc sửa if(loading) ++


  return (
    <div className="schedule-page">
      <Navbar />
      <main className="schedule-content">
        <h1>Lịch trình bảo dưỡng cho xe {licensePlate}</h1>

         {error && <p className="error-message centered">{error}</p>}

        {/* --- Modal Form Đặt Lịch --- */}
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
        {/* --- Kết thúc Modal --- */}


        {schedule.length > 0 ? (
          <div className="schedule-list">
            {schedule.map((item) => (
              <div key={item.maintenancePlanId} className={`schedule-item status-${item.status?.toLowerCase()}`}>
                <div className="schedule-item-header">
                  <h3>{item.planName}</h3>
                  {getStatusIcon(item.status)}
                </div>
                <p>{item.description || 'Không có mô tả chi tiết.'}</p>
                <p><strong>Mốc KM:</strong> {item.intervalKm?.toLocaleString()} km</p>
                {item.status === 'NEXT_TIME' && item.maintenancePlanId === firstNextTimePlanId && (
                  <button className="book-now-button" onClick={() => handleBookAppointmentClick(item)} >
                    <FaCalendarPlus /> Đặt lịch ngay
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          !error && <p className="no-data">Không có lịch trình bảo dưỡng nào cho xe này.</p>
        )}
         <button onClick={() => navigate(-1)} className="back-button">Quay lại Dashboard</button>
      </main>
      <Footer />
    </div>
  );
}

export default VehicleMaintenanceSchedule;