import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-text">
          <h1>EV Car Center</h1>
          <p className="location">
            TP.HCM – 2 chi nhánh:
            <br />
            <b>• 123 Lê Văn Việt, TP. Thủ Đức</b>
            <br />
            <b>• Đường D2, Khu CNC</b>
          </p>
          <p className="brands">Đối tác: VinFast, Tesla, Hyundai, KIA...</p>
        </div>

        <div className="hero-buttons center">
          <button
            className="btn primary hover-effect"
            onClick={() => navigate("/appoint")}
          >
            Đặt Lịch Ngay
          </button>
        </div>

        <div className="hero-image">
          <img
            src="https://via.placeholder.com/500x300?text=EV+Car+Center"
            alt="Hero"
          />
        </div>
      </section>
    </div>
  );
}
