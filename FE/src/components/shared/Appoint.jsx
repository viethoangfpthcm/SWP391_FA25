import React from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import Footer from "@components/layout/Footer.jsx";
import Navbar from "@components/layout/Navbar.jsx";
import {
  FaClipboardList,
  FaClock,
  FaTools,
  FaCheckCircle,
  FaCreditCard,
  FaCar
} from "react-icons/fa";
import "./Appoint.css";
import Button from "@components/ui/Button.jsx";


export default function Appoint() {
  const navigate = useNavigate(); // Sử dụng hook navigate

  // Hàm xử lý mới cho nút "Đặt lịch ngay"
  const handleNavigateToDashboard = () => {
    
    navigate("/customer/dashboard");
  };

  // Giữ nguyên các bước giới thiệu
  const steps = [
    { icon: <FaClipboardList />, title: "Đặt lịch Online", desc: "Chọn thời gian và thông tin xe của bạn." },
    { icon: <FaClock />, title: "Xác nhận & Nhận xe", desc: "Xác nhận lịch hẹn và đến trung tâm." },
    { icon: <FaTools />, title: "Bảo dưỡng chuyên sâu", desc: "Vệ sinh, kiểm tra và tối ưu hệ thống." },
    { icon: <FaCheckCircle />, title: "Kiểm tra & Báo cáo", desc: "Nhận báo cáo chi tiết tình trạng xe." },
    { icon: <FaCreditCard />, title: "Thanh toán linh hoạt", desc: "Thanh toán online hoặc trực tiếp." },
    { icon: <FaCar />, title: "Giao xe hoàn tất", desc: "Nhận xe đã hoàn thiện và bảo hành." },
  ];

  return (
    <div className="appoint-page">
      <Navbar />

      {/* Section 1: Giới thiệu (Giữ nguyên) */}
      <section className="appoint-intro">
        <h1>Dịch vụ bảo dưỡng xe điện chuyên nghiệp</h1>
        <p>
          Từ đặt lịch online đến kiểm tra, bảo dưỡng và thanh toán – mọi thứ được tối ưu cho trải nghiệm tốt nhất.
        </p>

        <div className="appoint-steps">
          {steps.map((s, i) => (
            <div key={i} className="appoint-step-card">
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

       
        <Button className="scroll-btn" onClick={handleNavigateToDashboard}>
          Đặt lịch ngay
        </Button>
      </section>

     

      <Footer />
    </div>
  );
}