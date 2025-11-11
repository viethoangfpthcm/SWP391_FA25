import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@config/api.js';

export default function useCustomerDashboard() {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Vehicle / add vehicle
    const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
    const [newVehicleData, setNewVehicleData] = useState({ licensePlate: '', model: '', year: '', purchaseDate: '', currentKm: '' });
    const [addVehicleLoading, setAddVehicleLoading] = useState(false);
    const [addVehicleError, setAddVehicleError] = useState('');

    // Profile
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ fullName: '', email: '', phone: '', password: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Modals + feedback
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
    const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: '' });

    const [vehicleModels, setVehicleModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(true);

    useEffect(() => {
        const fetchVehicleModels = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_BASE_URL + '/api/customer/vehicle-models', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch vehicle models');
                const data = await response.json();
                setVehicleModels(Array.isArray(data) ? data : []);
            } catch (err) {
                setVehicleModels(['VinFast VF 3', 'VinFast VF 5', 'VinFast VF 7', 'VinFast VF 9']);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchVehicleModels();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            setError('Vui lòng đăng nhập để xem trang này.');
            setLoading(false);
            navigate('/');
            return false;
        }

        setLoading(true);
        try {
            const dashboardPromise = fetch(API_BASE_URL + '/api/customer/dashboard/' + userId, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const bookingsPromise = fetch(API_BASE_URL + '/api/customer/bookings/customerBookings/' + userId, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const [dashboardResponse, bookingsResponse] = await Promise.all([dashboardPromise, bookingsPromise]);

            if (!dashboardResponse.ok) {
                if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                    setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.clear();
                    navigate('/');
                } else {
                    throw new Error(`Lỗi tải dashboard: ${dashboardResponse.status}`);
                }
                return false;
            }
            const data = await dashboardResponse.json();
            setDashboardData(data);
            setError('');

            if (!bookingsResponse.ok) {
                setBookings([]);
            } else {
                const bookingsData = await bookingsResponse.json();
                setBookings(bookingsData);
            }
            return true;
        } catch (err) {
            console.error('Lỗi khi fetch dashboard data:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    // Vehicle actions
    const handleAddVehicleClick = () => {
        setShowAddVehicleForm(true);
        setAddVehicleError('');
        setNewVehicleData({ licensePlate: '', model: '', year: '', purchaseDate: '', currentKm: '' });
    };
    const handleNewVehicleChange = (e) => {
        const { name, value } = e.target;
        setNewVehicleData(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewVehicle = async (e) => {
        e.preventDefault();
        setAddVehicleLoading(true);
        setAddVehicleError('');
        const token = localStorage.getItem('token');
        if (!newVehicleData.licensePlate || !newVehicleData.model || !newVehicleData.year || !newVehicleData.purchaseDate) {
            setAddVehicleError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
            setAddVehicleLoading(false);
            return;
        }
        const hcmPlateRegex = /^(1[1-9]|[2-9][0-9])[A-Z0-9][- ]?\d{3}[.]?\d{2}$/i;
        if (!hcmPlateRegex.test(newVehicleData.licensePlate)) {
            setAddVehicleError('Định dạng biển số xe không hợp lệ. Ví dụ: 51A-123.45.');
            setAddVehicleLoading(false);
            return;
        }

        try {
            const payload = { ...newVehicleData, year: parseInt(newVehicleData.year, 10) || null, currentKm: parseInt(newVehicleData.currentKm, 10) || 0 };
            const response = await fetch(API_BASE_URL + '/api/customer/create-vehicle', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
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
            setSuccessModalMessage('Thêm xe thành công!');
            setSuccessModalAction(null);
            setShowSuccessModal(true);
            fetchDashboardData();
        } catch (err) {
            console.error('Lỗi khi thêm xe:', err);
            setAddVehicleError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setAddVehicleLoading(false);
        }
    };

    // Delete vehicle
    const executeDeleteVehicle = async (licensePlate) => {
        const token = localStorage.getItem('token');
        setCancelBookingLoading(true);
        try {
            const response = await fetch(API_BASE_URL + '/api/customer/delete-vehicle?licensePlate=' + encodeURIComponent(licensePlate), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Lỗi ${response.status}`);
            }
            setShowConfirmModal(false);
            setSuccessModalMessage('Xóa xe thành công!');
            setShowSuccessModal(true);
            fetchDashboardData();
        } catch (err) {
            console.error('Lỗi khi xóa xe:', err);
            setError(err.message || 'Đã xảy ra lỗi khi xóa xe.');
            setShowConfirmModal(false);
        } finally {
            setCancelBookingLoading(false);
        }
    };

    // Cancel booking
    const executeCancelBooking = async (bookingId) => {
        setCancelBookingLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(API_BASE_URL + '/api/customer/bookings/' + bookingId + '/cancel', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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
            setShowConfirmModal(false);
            setSuccessModalMessage('Đã hủy lịch hẹn thành công.');
            setSuccessModalAction(null);
            setShowSuccessModal(true);
            fetchDashboardData();
        } catch (err) {
            console.error('Lỗi khi hủy lịch:', err);
            setError(err.message || 'Đã xảy ra lỗi khi hủy lịch hẹn.');
            setShowConfirmModal(false);
        } finally {
            setCancelBookingLoading(false);
        }
    };

    const handleCancelBookingClick = (bookingId) => {
        setConfirmModalMessage('Bạn có chắc chắn muốn hủy lịch hẹn này?');
        setOnConfirmAction(() => () => executeCancelBooking(bookingId));
        setShowConfirmModal(true);
    };

    const handleDeleteVehicleClick = (licensePlate) => {
        setConfirmModalMessage(`Bạn có chắc chắn muốn xóa xe có biển số ${licensePlate}?`);
        setOnConfirmAction(() => () => executeDeleteVehicle(licensePlate));
        setShowConfirmModal(true);
    };

    // Feedback
    const handleFeedbackClick = async (bookingId) => {
        const token = localStorage.getItem('token');
        setCurrentBookingId(bookingId);
        setFeedbackError('');
        setFeedbackLoading(true);
        setShowFeedbackModal(true);
        try {
            const response = await fetch(API_BASE_URL + '/api/feedback/' + bookingId, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (response.status === 200) {
                const oldFeedback = await response.json();
                setFeedbackData({ rating: oldFeedback.rating || 0, comment: oldFeedback.comment || '' });
            } else if (response.status === 204) {
                setFeedbackData({ rating: 0, comment: '' });
            } else {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Feedback GET API Error:', errorText);
                    throw new Error(`Lỗi tải dữ liệu đánh giá: ${response.status}`);
                }
                setFeedbackData({ rating: 0, comment: '' });
            }
        } catch (err) {
            console.error('Lỗi khi lấy feedback cũ:', err);
            setFeedbackData({ rating: 0, comment: '' });
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
        const token = localStorage.getItem('token');
        const payload = { rating: parseInt(feedbackData.rating, 10), comment: feedbackData.comment };
        try {
            const response = await fetch(API_BASE_URL + '/api/feedback/' + currentBookingId, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Lỗi ${response.status}`);
            }
            setShowFeedbackModal(false);
            setCurrentBookingId(null);
            setSuccessModalMessage('Gửi đánh giá thành công!');
            setSuccessModalAction(null);
            setShowSuccessModal(true);
            fetchDashboardData();
        } catch (err) {
            console.error('Lỗi khi gửi feedback:', err);
            setFeedbackError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setFeedbackLoading(false);
        }
    };

    // Profile handlers
    const handleEditProfileClick = () => {
        if (!dashboardData || !dashboardData.customerInfo) return;
        setProfileData({ fullName: dashboardData.customerInfo.fullName || '', email: dashboardData.customerInfo.email || '', phone: dashboardData.customerInfo.phone || '', password: '' });
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
        const token = localStorage.getItem('token');
        if (!/^[A-Za-zÀ-ỹ\s]+$/.test(profileData.fullName.trim()) || profileData.fullName.trim().length < 2) {
            setProfileError('Tên chỉ được chứa chữ cái và phải có ít nhất 2 ký tự');
            setProfileLoading(false);
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            setProfileError('Email không hợp lệ');
            setProfileLoading(false);
            return;
        }
        if (!/^[0-9]{10}$/.test(profileData.phone)) {
            setProfileError('Số điện thoại phải có đúng 10 chữ số');
            setProfileLoading(false);
            return;
        }
        if (profileData.password && profileData.password.length < 6) {
            setProfileError('Mật khẩu phải có ít nhất 6 ký tự');
            setProfileLoading(false);
            return;
        }
        const payload = { fullName: profileData.fullName, email: profileData.email, phone: profileData.phone, password: profileData.password ? profileData.password : null };
        try {
            const response = await fetch(API_BASE_URL + '/api/users/update-profile', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
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
            setSuccessModalMessage('Cập nhật thông tin thành công!');
            setSuccessModalAction(null);
            setShowSuccessModal(true);
            fetchDashboardData();
        } catch (err) {
            console.error('Lỗi khi cập nhật profile:', err);
            setProfileError(err.message || 'Lỗi không xác định.');
        } finally {
            setProfileLoading(false);
        }
    };

    return {
        // state
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
        currentBookingId,
        feedbackData,
        vehicleModels,
        loadingModels,
        // actions
        fetchDashboardData,
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
        // modal setters
        setShowAddVehicleForm,
        setShowProfileModal,
        setShowSuccessModal,
        setShowConfirmModal,
        setOnConfirmAction,
        setSuccessModalAction,
        setConfirmModalMessage,
        setShowFeedbackModal,
        setSuccessModalMessage,
    };
}
