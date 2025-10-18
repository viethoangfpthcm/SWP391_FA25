import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './VehicleMaintenanceSchedule.css'; 
import { FaCalendarAlt, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function VehicleMaintenanceSchedule() {
  const { licensePlate } = useParams(); // Lấy biển số xe từ URL
  const [schedule, setSchedule] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        // Fetch schedule data
        const scheduleResponse = await fetch(`${API_BASE}/api/customer/maintenance-schedule?licensePlate=${encodeURIComponent(licensePlate)}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!scheduleResponse.ok) {
           if (scheduleResponse.status === 401 || scheduleResponse.status === 403) {
              setError("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.");
              navigate("/");
           } else if (scheduleResponse.status === 404) {
             setError(`Không tìm thấy lịch bảo dưỡng cho xe ${licensePlate}.`);
           } else {
              throw new Error(`Lỗi ${scheduleResponse.status}: Không thể tải lịch bảo dưỡng.`);
           }
           setSchedule([]); // Đặt thành mảng rỗng nếu có lỗi
           return; // Dừng nếu có lỗi
        }

        const scheduleData = await scheduleResponse.json();
        setSchedule(Array.isArray(scheduleData) ? scheduleData : []); // Đảm bảo luôn là mảng
        setError('');

     // thêm 1 api xem chi tiết thông tin xe cho fe /api/customer/view/vehicles

      } catch (err) {
        console.error("Lỗi khi fetch maintenance schedule:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        setSchedule([]); // Đặt thành mảng rỗng khi có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [licensePlate, navigate, API_BASE]);

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

   if (loading) {
     return (
       <div className="schedule-page loading-container">
         <Navbar />
         <p>Đang tải lịch bảo dưỡng...</p>
         <Footer />
       </div>
     );
   }


  return (
    <div className="schedule-page">
      <Navbar />
      <main className="schedule-content">
        <h1>Lịch trình bảo dưỡng cho xe {licensePlate}</h1>
     

         {error && <p className="error-message centered">{error}</p>}

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
            
              </div>
            ))}
          </div>
        ) : (
          // Chỉ hiển thị "Không có lịch trình" nếu không có lỗi nào khác
          !error && <p className="no-data">Không có lịch trình bảo dưỡng nào cho xe này.</p>
        )}
         <button onClick={() => navigate(-1)} className="back-button">Quay lại Dashboard</button>
      </main>
      <Footer />
    </div>
  );
}

export default VehicleMaintenanceSchedule;