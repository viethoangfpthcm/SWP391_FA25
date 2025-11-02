import React from "react";
import "./Loading.css";
// Use the existing image in src/assets/images. Adjust path relative to this file.
import CarImage from "../../assets/images/VF3.png";

// Loading component supports two modes:
// - fullScreen (default): shows the animated car overlay used across the app
// - inline: renders a small spinner suitable for buttons or inline placeholders
export default function Loading({ fullScreen = true, size = 40, text = "Đang tải..." }) {
  if (!fullScreen) {
    const s = Math.max(12, size);
    return (
      <span className="inline-loading" style={{ height: s, width: s }} aria-hidden>
        <svg viewBox="0 0 50 50" className="inline-spinner" style={{ height: s, width: s }}>
          <circle cx="25" cy="25" r="20" />
        </svg>
      </span>
    );
  }

  return (
    <div className="loading-overlay">
      <div className="car-track">
        <img src={CarImage} alt="Car" className="car" />
      </div>
      <p>{text}</p>
    </div>
  );
}
