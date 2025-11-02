import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import './CustomerDashboard.css';


import { FaUser, FaCar, FaCalendarAlt, FaPlus, FaTimes, FaEdit, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaStar } from 'react-icons/fa';import Button from '@components/ui/Button.jsx';
import Loading from '@components/ui/Loading.jsx';


const BOOKING_STATUS_MAP = {
  PENDING:     { text: 'Chờ xử lý',    className: 'pending' },
  APPROVED:    { text: 'Đã duyệt',     className: 'approved' }, 
  ASSIGNED:    { text: 'Đã gán thợ',    className: 'assigned' }, 
  IN_PROGRESS: { text: 'Đang xử lý',   className: 'in_progress' }, 
  COMPLETED:   { text: 'Hoàn thành',   className: 'completed' },
  PAID:        { text: 'Đã thanh toán', className: 'paid' },
  CANCELLED:   { text: 'Đã hủy',       className: 'cancelled' },
  DECLINED:    { text: 'Đã từ chối',  className: 'declined' },
  DEFAULT:     { text: 'Không rõ',     className: 'default' }
};
const getStatusDisplay = (status) => {
  return BOOKING_STATUS_MAP[status] || { text: status, className: 'default' };
};
function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({ /* ... */ });
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);
  const [addVehicleError, setAddVehicleError] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [successModalAction, setSuccessModalAction] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  const [cancelBookingLoading, setCancelBookingLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: '',
  });
  const [vehicleToDelete, setVehicleToDelete] = useState(null);


  const vinfastModels = [
    "VinFast VF 3",
    "VinFast VF 5",
    "VinFast VF 7",
    "VinFast VF 9",
  ];

  const API_BASE = "";



  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Vui lòng đăng nhập để xem trang này.");
      setLoading(false);
      navigate("/");
      return false;
    }
    setLoading(true);

    try {
      const dashboardPromise = fetch(`${API_BASE}/api/customer/dashboard/${userId}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      const bookingsPromise = fetch(`${API_BASE}/api/customer/bookings/customerBookings/${userId}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      const [dashboardResponse, bookingsResponse] = await Promise.all([dashboardPromise, bookingsPromise]);

      if (!dashboardResponse.ok) {
        if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.clear();
          navigate("/");
        } else {
          throw new Error(`Lỗi tải dashboard: ${dashboardResponse.status}`);
        }
        return false;
      }
      const data = await dashboardResponse.json();
      setDashboardData(data);
      setError('');

      if (!bookingsResponse.ok) {
        console.warn("Không thể tải danh sách lịch hẹn:", bookingsResponse.status);
        setBookings([]);
      } else {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }
      return true;

    } catch (err) {
      console.error("Lỗi khi fetch dashboard data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBookingClickDashboard = (bookingId) => {
    setConfirmModalMessage("Bạn có chắc chắn muốn hủy lịch hẹn này?");
    setOnConfirmAction(() => () => executeCancelBookingDashboard(bookingId));
    setShowConfirmModal(true);
  };
  // Hàm mở modal xác nhận xóa xe
const handleDeleteVehicleClick = (licensePlate) => {
  setConfirmModalMessage(`Bạn có chắc chắn muốn xóa xe có biển số ${licensePlate}?`);
  setOnConfirmAction(() => () => executeDeleteVehicle(licensePlate));
  setShowConfirmModal(true);
};

// Hàm gọi API xóa xe
const executeDeleteVehicle = async (licensePlate) => {
  const token = localStorage.getItem("token");
  setCancelBookingLoading(true); // có thể dùng chung loading state này

  try {
    const response = await fetch(
      `${API_BASE}/api/customer/delete-vehicle?licensePlate=${encodeURIComponent(licensePlate)}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Lỗi ${response.status}`);
    }

    setShowConfirmModal(false);
    setSuccessModalMessage("Xóa xe thành công!");
    setShowSuccessModal(true);

    // Cập nhật lại danh sách xe sau khi xóa
    fetchDashboardData();

  } catch (err) {
    console.error("Lỗi khi xóa xe:", err);
    setError(err.message || "Đã xảy ra lỗi khi xóa xe.");
    setShowConfirmModal(false);
  } finally {
    setCancelBookingLoading(false);
  }
};


  const executeCancelBookingDashboard = async (bookingId) => {
    setCancelBookingLoading(true);
    setError('');
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/api/customer/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (!response.ok) {
        // Xử lý lỗi từ backend
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Lỗi ${response.status}`);
        } catch (parseError) {
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }

      setShowConfirmModal(false);

      setSuccessModalMessage("Đã hủy lịch hẹn thành công.");
      setSuccessModalAction(null); // Không làm gì thêm
      setShowSuccessModal(true);
      fetchDashboardData();
    } catch (err) {
      console.error("Lỗi khi hủy lịch:", err);


      setError(err.message || "Đã xảy ra lỗi khi hủy lịch hẹn."); // Hiển thị lỗi chung
      setShowConfirmModal(false); // Đóng modal confirm khi có lỗi
    } finally {
      setCancelBookingLoading(false);
    }
  };
  const handleFeedbackClick = async (bookingId) => {
    const token = localStorage.getItem("token");
    setCurrentBookingId(bookingId);
    setFeedbackError('');
    setFeedbackLoading(true);
    setShowFeedbackModal(true);

    try {
      const response = await fetch(`${API_BASE}/api/feedback/${bookingId}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (response.status === 200) {
        const oldFeedback = await response.json();
        setFeedbackData({
          rating: oldFeedback.rating || 0,
          comment: oldFeedback.comment || '',
        });
      } else if (response.status === 204) {
        setFeedbackData({ rating: 0, comment: '' });
      } else {
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Feedback GET API Error:", errorText);
          throw new Error(`Lỗi tải dữ liệu đánh giá: ${response.status}`);
        }
        setFeedbackData({ rating: 0, comment: '' });
      }

    } catch (err) {
      console.error("Lỗi khi lấy feedback cũ:", err);
      setFeedbackData({ rating: 0, comment: '' }); e
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setFeedbackData(prev => ({ ...prev, rating: newRating }));
  };
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (feedbackData.rating === 0) {
      setFeedbackError('Vui lòng chọn số sao đánh giá.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    const token = localStorage.getItem("token");

    const payload = {
      rating: parseInt(feedbackData.rating, 10),
      comment: feedbackData.comment,
    };

    try {
      const response = await fetch(`${API_BASE}/api/feedback/${currentBookingId}`, {
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
        throw new Error(errorText || `Lỗi ${response.status}`);
      }

      // Đóng modal
      setShowFeedbackModal(false);
      setCurrentBookingId(null);

      // Hiển thị thông báo thành công
      setSuccessModalMessage("Gửi đánh giá thành công!");
      setSuccessModalAction(null);
      setShowSuccessModal(true);

      // Tải lại dữ liệu dashboard để cập nhật trạng thái 'hasFeedback'
      fetchDashboardData();

    } catch (err) {
      console.error("Lỗi khi gửi feedback:", err);
      setFeedbackError(err.message || 'Đã xảy ra lỗi không mong muốn.');
    } finally {
      setFeedbackLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, [navigate, API_BASE]);


  const handleViewSchedule = (licensePlate) => {
    navigate(`/customer/vehicle-schedule/${licensePlate}`);
  };
  const handleAddVehicleClick = () => {
    setShowAddVehicleForm(true);
    setAddVehicleError('');
    setNewVehicleData({
      licensePlate: '', model: '', year: '', purchaseDate: '', currentKm: '',
    });
  };
  const handleNewVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicleData(prevState => ({ ...prevState, [name]: value }));
  };
  const handleSaveNewVehicle = async (e) => {
    e.preventDefault();
    setAddVehicleLoading(true);
    setAddVehicleError('');
    const token = localStorage.getItem("token");

    if (!newVehicleData.licensePlate || !newVehicleData.model || !newVehicleData.year || !newVehicleData.purchaseDate) {
      setAddVehicleError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      setAddVehicleLoading(false);
      return;
    }
    const hcmPlateRegex = /^(41|5[0-9])[A-Z0-9][- ]?\d{3}[.]?\d{2}$/i;
    if (!hcmPlateRegex.test(newVehicleData.licensePlate)) {
      setAddVehicleError('Định dạng biển số xe TP.HCM không hợp lệ. Ví dụ: 51A-123.45.');
      setAddVehicleLoading(false);
      return;
    }

    try {
      const payload = {
        ...newVehicleData,
        year: parseInt(newVehicleData.year, 10) || null,
        currentKm: parseInt(newVehicleData.currentKm, 10) || 0,
      };
      const response = await fetch(`${API_BASE}/api/customer/create-vehicle`, {
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

      setShowAddVehicleForm(false);

      setSuccessModalMessage("Thêm xe thành công!");
      setSuccessModalAction(null); // Không làm gì khi bấm OK
      setShowSuccessModal(true);

      fetchDashboardData();

    } catch (err) {
      console.error("Lỗi khi thêm xe:", err);
      setAddVehicleError(err.message || "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setAddVehicleLoading(false);
    }
  };

  const handleEditProfileClick = () => {
    if (!dashboardData || !dashboardData.customerInfo) return;

    setProfileData({
      fullName: dashboardData.customerInfo.fullName || '',
      email: dashboardData.customerInfo.email || '',
      phone: dashboardData.customerInfo.phone || '',
      password: ''
    });
    setProfileError('');
    setShowProfileModal(true);
  };


  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    const token = localStorage.getItem("token");

    if (!/^[A-Za-zÀ-ỹ\s]+$/.test(profileData.fullName.trim()) || profileData.fullName.trim().length < 2) {
      setProfileError("Tên chỉ được chứa chữ cái và phải có ít nhất 2 ký tự");
      setProfileLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setProfileError("Email không hợp lệ");
      setProfileLoading(false);
      return;
    }

    if (!/^[0-9]{10}$/.test(profileData.phone)) {
      setProfileError("Số điện thoại phải có đúng 10 chữ số");
      setProfileLoading(false);
      return;
    }

    if (profileData.password && profileData.password.length < 6) {
      setProfileError("Mật khẩu phải có ít nhất 6 ký tự");
      setProfileLoading(false);
      return;
    }

    const payload = {
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,

      password: profileData.password ? profileData.password : null
    };

    try {
      const response = await fetch(`${API_BASE}/api/users/update-profile`, {
        method: "PUT",
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
          throw new Error(errorJson.message || `Lỗi ${response.status}`);
        } catch (parseError) {
          throw new Error(`Lỗi ${response.status}: ${errorText}`);
        }
      }


      setShowProfileModal(false);


      setSuccessModalMessage("Cập nhật thông tin thành công!");
      setSuccessModalAction(null);
      setShowSuccessModal(true);


      fetchDashboardData();

    } catch (err) {
      console.error("Lỗi khi cập nhật profile:", err);
      setProfileError(err.message || 'Lỗi không xác định.');
    } finally {
      setProfileLoading(false);
    }
  };



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
  const activeStatuses = ['PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS'];
  const activeBookings = bookings.filter(b => activeStatuses.includes(b.status))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

  const historyStatuses = ['COMPLETED', 'PAID', 'CANCELLED', 'DECLINED'];
  const bookingHistory = bookings.filter(b => historyStatuses.includes(b.status))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));


  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-content">
        <h1>Bảng điều khiển khách hàng</h1>


        {showAddVehicleForm && (
          <div className="modal-overlay">
            <div className="modal-content add-vehicle-form">

              <div className="modal-header">
                <h2>Thêm xe mới</h2>
                <Button onClick={() => setShowAddVehicleForm(false)} className="close-modal-btn">
                  <FaTimes />
                </Button>
              </div>
              <form onSubmit={handleSaveNewVehicle}>
                {addVehicleError && <p className="error-message">{addVehicleError}</p>}
                <div className="form-group">
                  <label htmlFor="licensePlate">Biển số xe *</label>
                  <input type="text" id="licensePlate" name="licensePlate" value={newVehicleData.licensePlate} onChange={handleNewVehicleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="model">Dòng xe (Model) *</label>
                  <select id="model" name="model" value={newVehicleData.model} onChange={handleNewVehicleChange} required >
                    <option value="" disabled>-- Chọn dòng xe --</option>
                    {vinfastModels.map(modelName => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="year">Năm sản xuất *</label>
                  <input type="number" id="year" name="year" value={newVehicleData.year} onChange={handleNewVehicleChange} required min="1900" max={new Date().getFullYear() + 1} />
                </div>
                <div className="form-group">
                  <label htmlFor="purchaseDate">Ngày mua *</label>
                  <input type="date" id="purchaseDate" name="purchaseDate" value={newVehicleData.purchaseDate} onChange={handleNewVehicleChange} required max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label htmlFor="currentKm">Số KM hiện tại</label>
                  <input type="number" id="currentKm" name="currentKm" value={newVehicleData.currentKm} onChange={handleNewVehicleChange} min="0" />
                </div>

                <div className="form-actions">
                  <Button type="button" onClick={() => setShowAddVehicleForm(false)} className="btn-cancel" disabled={addVehicleLoading}>Hủy</Button>
                  <Button type="submit" className="btn-save" disabled={addVehicleLoading}>
                    {addVehicleLoading ? 'Đang lưu...' : 'Lưu xe'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        {showProfileModal && (
          <div className="modal-overlay">
            <div className="modal-content add-vehicle-form">
              <div className="modal-header">
                <h2>Cập nhật thông tin</h2>
                <Button onClick={() => setShowProfileModal(false)} className="close-modal-btn">
                  <FaTimes />
                </Button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                {profileError && <p className="error-message">{profileError}</p>}

                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input type="text" id="fullName" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Mật khẩu mới</label>
                  <input type="password" id="password" name="password" value={profileData.password} onChange={handleProfileChange} placeholder="Để trống nếu không muốn đổi" />
                </div>

                <div className="form-actions">
                  <Button type="button" onClick={() => setShowProfileModal(false)} className="btn-cancel" disabled={profileLoading}>Hủy</Button>
                  <Button type="submit" className="btn-save" disabled={profileLoading}>
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content success-modal">
              <div className="success-modal-body">
                <FaCheckCircle className="success-icon" />
                <p>{successModalMessage}</p>
              </div>
              <div className="form-actions">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (successModalAction) {
                      successModalAction();
                    }
                  }}
                  className="btn-save"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        )}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content confirm-modal">
              <div className="confirm-modal-body">
                <FaExclamationTriangle className="confirm-icon" />
                <h3>Xác nhận hành động</h3>
                <p>{confirmModalMessage}</p>
              </div>
              <div className="form-actions">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-cancel"
                  disabled={cancelBookingLoading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() => {
                    if (onConfirmAction) {
                      onConfirmAction();
                    }
                  }}
                  className="btn-confirm-danger"
                  disabled={cancelBookingLoading}
                >
                  {cancelBookingLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {showFeedbackModal && (
          <div className="modal-overlay">
            <div className="modal-content feedback-modal">
              <div className="modal-header">
                <h2>Đánh giá dịch vụ</h2>
                <Button onClick={() => setShowFeedbackModal(false)} className="close-modal-btn">
                  <FaTimes />
                </Button>
              </div>
              <form onSubmit={handleSubmitFeedback}>
                {feedbackError && <p className="error-message">{feedbackError}</p>}

                <div className="form-group rating-group">
                  <label>Đánh giá của bạn *</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= feedbackData.rating ? 'star-selected' : 'star-empty'}
                        onClick={() => handleRatingChange(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Bình luận (tùy chọn)</label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows="4"
                    value={feedbackData.comment}
                    onChange={handleFeedbackChange}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <Button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="btn-cancel"
                    disabled={feedbackLoading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="btn-save"
                    disabled={feedbackLoading}
                  >
                    {feedbackLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        <section className="dashboard-section profile-section">

          <div className="profile-header">
            <h2><FaUser /> Thông tin cá nhân</h2>
            <Button className="edit-profile-btn" onClick={handleEditProfileClick} title="Cập nhật thông tin">
              <FaEdit /> Tùy chỉnh
            </Button>
          </div>


          {customerInfo ? (
            <div className="profile-details">
              <p><strong>Họ và tên:</strong> {customerInfo.fullName}</p>
              <p><strong>Email:</strong> {customerInfo.email}</p>
              <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
            </div>
          ) : (
            <p>Không có thông tin khách hàng.</p>
          )}
        </section>

        <hr className="section-divider" />

        {/* Danh sách xe (Giữ nguyên) */}
        <section className="dashboard-section vehicle-section">
          <div className="vehicle-header">
            <h2><FaCar /> Danh sách xe</h2>
            <Button className="add-vehicle-btn" onClick={handleAddVehicleClick} title="Thêm xe mới">
              <FaPlus /> Thêm xe
            </Button>
          </div>
          {vehicles && vehicles.length > 0 ? (
            <div className="vehicle-list">
              {vehicles.map((vehicle) => (
                <div key={vehicle.licensePlate} className="vehicle-card">
                  <h3>{vehicle.model} ({vehicle.year})</h3>
                  <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
                  <p><strong>Số KM hiện tại:</strong> {vehicle.currentKm?.toLocaleString() || 'Chưa cập nhật'} km</p>
                  <div className="vehicle-actions">
  <Button onClick={() => handleViewSchedule(vehicle.licensePlate)}>Xem lịch bảo dưỡng</Button>
  <Button className="btn-delete" onClick={() => handleDeleteVehicleClick(vehicle.licensePlate)}>Xóa xe</Button>
</div>

                </div>
              ))}
            </div>
          ) : (
            <p>Bạn chưa thêm xe nào.</p>
          )}
        </section>

        <hr className="section-divider" />

        <section className="dashboard-section booking-stats-section">
          <h2><FaCalendarAlt /> Lịch sử & Thống kê Lịch hẹn</h2>

          {/* Sử dụng calculatedStats thay vì bookingStats */}
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.totalBookings || 0}</span>
              <span className="stat-label">Tổng lịch hẹn</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.pendingBookings || 0}</span>
              <span className="stat-label">Chờ xử lý</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.approvedBookings || 0}</span>
              <span className="stat-label">Đã duyệt</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.assignedBookings || 0}</span>
              <span className="stat-label">Đã gán thợ</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.inProgressBookings || 0}</span>
              <span className="stat-label">Đang xử lý</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.completedBookings || 0}</span>
              <span className="stat-label">Đã hoàn thành</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{calculatedStats.paidBookings || 0}</span>
              <span className="stat-label">Đã thanh toán</span>
            </div>
            <div className="stat-item wide">
              <span className="stat-label">Lịch hẹn gần nhất:</span>
              <span className="stat-value small">
                {calculatedStats.lastBookingDate
                  ? new Date(calculatedStats.lastBookingDate).toLocaleString('vi-VN')
                  : 'Chưa có'}
              </span>
            </div>
          </div>

          <div className="booking-list-container">
            <h3>Lịch hẹn đang xử lý</h3>
            {loading ? (
              <p>Đang tải lịch hẹn...</p>
            ) : activeBookings.length > 0 ? (
              <div className="booking-list">
                {activeBookings.map(booking => (
                  <div key={booking.bookingId} className={`booking-item status-${getStatusDisplay(booking.status).className}`}>
                    <div className="booking-item-header">
                      <strong>{booking.vehiclePlate}</strong> ({booking.vehicleModel})
                      <span className={`booking-status status-label-${getStatusDisplay(booking.status).className}`}>
                        {getStatusDisplay(booking.status).text}
                      </span>
                    </div>
                    <p><strong>Trung tâm:</strong> {booking.centerName}</p>
                    <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
                    {booking.note && <p className="booking-note"><strong>Ghi chú:</strong> {booking.note}</p>}
                    {booking.status === 'PENDING' && (
                      <Button
                        className="btn-cancel-small"
                        onClick={() => handleCancelBookingClickDashboard(booking.bookingId)}
                        disabled={cancelBookingLoading}
                        title="Hủy lịch hẹn này"
                      >
                        <FaTimes /> Hủy
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có lịch hẹn nào đang xử lý.</p>
            )}
          </div>

          <div className="booking-list-container">
            <h3>Lịch sử hẹn</h3>
            {loading ? (
              <p>Đang tải lịch sử...</p>
            ) : bookingHistory.length > 0 ? (
              <div className="booking-list">
                {bookingHistory.map(booking => (
                <div key={booking.bookingId} className={`booking-item status-${getStatusDisplay(booking.status).className}`}>
                  <div className="booking-item-header">
                    <strong>{booking.vehiclePlate}</strong> ({booking.vehicleModel})
                    <span className={`booking-status status-label-${getStatusDisplay(booking.status).className}`}>
                      {getStatusDisplay(booking.status).text}
                    </span>
                  </div>
                  <p><strong>Trung tâm:</strong> {booking.centerName}</p>
                  <p><strong>Ngày hẹn:</strong> {new Date(booking.bookingDate).toLocaleString('vi-VN')}</p>
                  {(booking.status === 'COMPLETED' || booking.status === 'PAID') && (
                    <Button
                      className="btn-feedback"
                      onClick={() => handleFeedbackClick(booking.bookingId)}
                      title="Đánh giá dịch vụ"
                    >
                      <FaStar /> {booking.hasFeedback ? 'Sửa đánh giá' : 'Đánh giá'}
                    </Button>
                  )}
                </div>
              ))}
              </div>
            ) : (
              <p>Chưa có lịch sử hẹn nào.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default CustomerDashboard;