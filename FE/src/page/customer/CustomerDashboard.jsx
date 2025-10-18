import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './CustomerDashboard.css';

import { FaUser, FaCar, FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa';

function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false); 
  const [newVehicleData, setNewVehicleData] = useState({ 
    licensePlate: '',
    model: '',
    year: '',
    purchaseDate: '', // Định dạng YYYY-MM-DD
    currentKm: '',
   
  });
  const [addVehicleLoading, setAddVehicleLoading] = useState(false); 
  const [addVehicleError, setAddVehicleError] = useState(''); 

 const vinfastModels = [
    "VinFast VF 3",
    "VinFast VF 5",
    "VinFast VF 7",
    "VinFast VF 9",
  ];

  const API_BASE = import.meta.env.VITE_API_URL || "https://103.90.226.216:8443";

  
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Vui lòng đăng nhập để xem trang này.");
      setLoading(false);
      navigate("/");
      return false; // Báo hiệu thất bại
    }

    try {
      
      const response = await fetch(`${API_BASE}/api/customer/dashboard/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           setError("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
           localStorage.removeItem("token");
           localStorage.removeItem("userId");
           localStorage.removeItem("role");
           navigate("/");
        } else {
          throw new Error(`Lỗi ${response.status}: Không thể tải dữ liệu dashboard.`);
        }
        return false; // Báo hiệu thất bại
      }

      const data = await response.json();
      setDashboardData(data);
      setError('');
      return true; // Báo hiệu thành công
    } catch (err) {
      console.error("Lỗi khi fetch dashboard data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      return false; // Báo hiệu thất bại
    } finally {
      setLoading(false); 
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, [navigate, API_BASE]); // Fetch lần đầu

  const handleViewSchedule = (licensePlate) => {
    navigate(`/customer/vehicle-schedule/${licensePlate}`);
  };

 
  const handleAddVehicleClick = () => { 
    setShowAddVehicleForm(true);
    setAddVehicleError(''); 
    
    setNewVehicleData({
        licensePlate: '',
        model: '',
        year: '',
        purchaseDate: '',
        currentKm: '',
    });
  };



  const handleNewVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicleData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };



  const handleSaveNewVehicle = async (e) => {
    e.preventDefault();
    setAddVehicleLoading(true);
    setAddVehicleError('');
    const token = localStorage.getItem("token");

    // --- VALIDATION ---
    if (!newVehicleData.licensePlate || !newVehicleData.model || !newVehicleData.year || !newVehicleData.purchaseDate) {
        setAddVehicleError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
        setAddVehicleLoading(false);
        return;
    }

    
    const hcmPlateRegex = /^(41|5[0-9])[A-Z0-9][- ]?\d{3}[.]?\d{2}$/i; 
    if (!hcmPlateRegex.test(newVehicleData.licensePlate)) {
        setAddVehicleError('Định dạng biển số xe TP.HCM không hợp lệ. Ví dụ: 51A-123.45 hoặc 41F12345.');
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
             // Thử parse lỗi dạng JSON
             const errorJson = JSON.parse(errorText);
             throw new Error(errorJson.message || errorJson.error || `Lỗi ${response.status}: ${errorText}`);
         } catch (parseError) {
            // Nếu không phải JSON thì hiển thị text
             throw new Error(`Lỗi ${response.status}: ${errorText}`);
         }
      }

      // Thành công
      setShowAddVehicleForm(false); 
      alert("Thêm xe thành công!");
      setLoading(true); 
      fetchDashboardData(); // Tải lại dữ liệu dashboard để hiển thị xe mới

    } catch (err) {
      console.error("Lỗi khi thêm xe:", err);
      setAddVehicleError(err.message || "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setAddVehicleLoading(false);
    }
  };



  if (loading && !dashboardData) { 
    return (
      <div className="dashboard-page loading-container">
        <Navbar />
        <p>Đang tải dữ liệu...</p>
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

   // Xử lý trường hợp fetch thành công nhưng không có dữ liệu trả về
   if (!dashboardData) {
      return (
        <div className="dashboard-page empty-container">
          <Navbar />
          <p>Không có dữ liệu để hiển thị. Vui lòng thử lại sau.</p>
          <Footer />
        </div>
      );
   }


  const { customerInfo, vehicles, bookingStats } = dashboardData;

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
                <button onClick={() => setShowAddVehicleForm(false)} className="close-modal-btn">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveNewVehicle}> 
                {addVehicleError && <p className="error-message">{addVehicleError}</p>} 
                
                <div className="form-group">
                  <label htmlFor="licensePlate">Biển số xe *</label>
                  <input type="text" id="licensePlate" name="licensePlate" value={newVehicleData.licensePlate} onChange={handleNewVehicleChange} required />
                </div>
                 <div className="form-group">
                  <label htmlFor="model">Dòng xe (Model) *</label>
                  <select
                    id="model"
                    name="model"
                    value={newVehicleData.model}
                    onChange={handleNewVehicleChange}
                    required
                  >
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
                  <input type="date" id="purchaseDate" name="purchaseDate" value={newVehicleData.purchaseDate} onChange={handleNewVehicleChange} required max={new Date().toISOString().split('T')[0]}/>
                 </div>
                 <div className="form-group">
                  <label htmlFor="currentKm">Số KM hiện tại</label>
                  <input type="number" id="currentKm" name="currentKm" value={newVehicleData.currentKm} onChange={handleNewVehicleChange} min="0" />
                 </div>
              
                 <div className="form-actions"> 
                   <button type="button" onClick={() => setShowAddVehicleForm(false)} className="btn-cancel" disabled={addVehicleLoading}>Hủy</button>
                   <button type="submit" className="btn-save" disabled={addVehicleLoading}>
                     {addVehicleLoading ? 'Đang lưu...' : 'Lưu xe'} 
                   </button>
                 </div>
              </form>
            </div>
          </div>
        )}
       


        {/* Thông tin cá nhân */}
        <section className="dashboard-section profile-section">
             <h2><FaUser /> Thông tin cá nhân</h2>
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

        {/* Danh sách xe */}
        <section className="dashboard-section vehicle-section">
            <div className="vehicle-header">
              <h2><FaCar /> Danh sách xe</h2>
              {/* ++ Thay đổi hàm onClick ++ */}
              <button className="add-vehicle-btn" onClick={handleAddVehicleClick} title="Thêm xe mới">
                <FaPlus /> Thêm xe
              </button>
            </div>
             {vehicles && vehicles.length > 0 ? (
               <div className="vehicle-list">
                 {vehicles.map((vehicle) => (
                   <div key={vehicle.licensePlate} className="vehicle-card">
                     <h3>{vehicle.model} ({vehicle.year})</h3>
                     <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
                     <p><strong>Số KM hiện tại:</strong> {vehicle.currentKm?.toLocaleString() || 'Chưa cập nhật'} km</p>
                     <button onClick={() => handleViewSchedule(vehicle.licensePlate)}>
                       Xem lịch bảo dưỡng
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
               <p>Bạn chưa thêm xe nào.</p>
             )}
        </section>

        <hr className="section-divider" />

        {/* Thống kê lịch hẹn */}
        <section className="dashboard-section booking-stats-section">
            <h2><FaCalendarAlt /> Thống kê lịch hẹn</h2>
            {bookingStats ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{bookingStats.totalBookings || 0}</span>
                  <span className="stat-label">Tổng lịch hẹn</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{bookingStats.pendingBookings || 0}</span>
                  <span className="stat-label">Chờ xử lý</span>
                </div>
                <div className="stat-item">
                   <span className="stat-value">{bookingStats.completedBookings || 0}</span>
                   <span className="stat-label">Đã hoàn thành</span>
                </div>
                 <div className="stat-item wide">
                   <span className="stat-label">Lịch hẹn gần nhất:</span>
                   <span className="stat-value small">{bookingStats.lastBookingDate ? new Date(bookingStats.lastBookingDate).toLocaleString('vi-VN') : 'Chưa có'}</span>
                 </div>
              </div>
            ) : (
              <p>Chưa có thông tin thống kê.</p>
            )}
        </section>

      </main>
      <Footer />
    </div>
  );
}

export default CustomerDashboard;