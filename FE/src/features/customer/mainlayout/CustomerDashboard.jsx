// src/features/customer/mainlayout/CustomerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import Loading from "@components/ui/Loading.jsx";
import "./CustomerDashboard.css";

// 🧩 Các components chia nhỏ
import AddVehicleModal from "../components/AddVehicleModal.jsx";
import BookingStats from "../components/BookingStats.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import CustomerProfile from "../components/CustomerProfile.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";
import SuccessModal from "../components/SuccessModal.jsx";
import VehicleList from "../components/VehicleList.jsx";

export default function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Trạng thái popup
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Biến trạng thái cho modal
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);

  const API_BASE = ""; // <-- Giữ nguyên, để backend tự append base URL

  // 🔹 Hàm lấy dữ liệu tổng hợp dashboard
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Vui lòng đăng nhập để xem trang này.");
      setLoading(false);
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const [dashRes, bookRes] = await Promise.all([
        fetch(`${API_BASE}/api/customer/dashboard/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/customer/bookings/customerBookings/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dashRes.ok) throw new Error(`Dashboard error ${dashRes.status}`);
      const dashboard = await dashRes.json();
      const bookingData = bookRes.ok ? await bookRes.json() : [];

      setDashboardData(dashboard);
      setBookings(bookingData);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải dữ liệu, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 🔹 Mở modal xác nhận
  const handleOpenConfirm = (message, action) => {
    setConfirmMessage(message);
    setOnConfirm(() => action);
    setShowConfirm(true);
  };

  // 🔹 Hiện thông báo thành công
  const handleShowSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  // 🔹 Giao diện chính
  if (loading) return <Loading />;
  if (error && !dashboardData) return <p>{error}</p>;

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-content">
        <h1>Bảng điều khiển khách hàng</h1>

        {/* Thông tin hồ sơ */}
        <CustomerProfile
          data={dashboardData?.customerInfo}
          onEdit={() => setShowProfileEdit(true)}
        />

        <hr className="section-divider" />

        {/* Danh sách xe */}
        <VehicleList
          vehicles={dashboardData?.vehicles}
          onAdd={() => setShowAddVehicle(true)}
          onDelete={(plate) =>
            handleOpenConfirm(`Xóa xe ${plate}?`, async () => {
              try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${API_BASE}/api/customer/delete-vehicle/${plate}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (!res.ok) throw new Error("Xóa xe thất bại");
                handleShowSuccess("Đã xóa xe thành công!");
                fetchDashboardData();
              } catch (err) {
                console.error(err);
                setError("Không thể xóa xe.");
              } finally {
                setShowConfirm(false);
              }
            })
          }
          onViewSchedule={(plate) =>
            navigate(`/customer/vehicle-schedule/${plate}`)
          }
        />

        <hr className="section-divider" />

        {/* Thống kê lịch hẹn */}
        <BookingStats
          bookings={bookings}
          onCancel={(id) =>
            handleOpenConfirm("Hủy lịch hẹn này?", async () => {
              try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${API_BASE}/api/customer/cancel-booking/${id}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (!res.ok) throw new Error("Hủy lịch hẹn thất bại");
                handleShowSuccess("Đã hủy lịch hẹn thành công!");
                fetchDashboardData();
              } catch (err) {
                console.error(err);
                setError("Không thể hủy lịch hẹn.");
              } finally {
                setShowConfirm(false);
              }
            })
          }
          onFeedback={(id) => {
            setCurrentBookingId(id);
            setShowFeedback(true);
          }}
        />

        {/* Modal thêm xe */}
        {showAddVehicle && (
          <AddVehicleModal
            onClose={() => setShowAddVehicle(false)}
            onSuccess={() => {
              setShowAddVehicle(false);
              handleShowSuccess("Thêm xe thành công!");
              fetchDashboardData();
            }}
          />
        )}

        {/* Modal chỉnh sửa hồ sơ */}
        {showProfileEdit && (
          <EditProfileModal
            profile={dashboardData?.customerInfo}
            onClose={() => setShowProfileEdit(false)}
            onSuccess={() => {
              setShowProfileEdit(false);
              handleShowSuccess("Cập nhật thông tin thành công!");
              fetchDashboardData();
            }}
          />
        )}

        {/* Modal feedback */}
        {showFeedback && currentBookingId && (
          <FeedbackModal
            bookingId={currentBookingId}
            onClose={() => setShowFeedback(false)}
            onSuccess={() => {
              setShowFeedback(false);
              handleShowSuccess("Gửi đánh giá thành công!");
              fetchDashboardData();
            }}
          />
        )}

        {/* Modal xác nhận */}
        {showConfirm && (
          <ConfirmModal
            message={confirmMessage}
            onConfirm={onConfirm}
            onClose={() => setShowConfirm(false)}
          />
        )}

        {/* Modal thành công */}
        {showSuccess && (
          <SuccessModal
            message={successMessage}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
