import React from "react";
import "./Loading.css";
import CarImage from "../assets/electric-car.png";

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="car-track">
        <img src={CarImage} alt="Car" className="car" />
      </div>
      <p>Đang tải...</p>
    </div>
  );
}
