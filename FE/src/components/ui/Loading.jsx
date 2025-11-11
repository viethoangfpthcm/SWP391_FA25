import React from "react";
import "./Loading.css";

// Professional Loading component with modern spinner
// - fullScreen (default): centered overlay with brand colors
// - inline: small spinner for buttons/cards
export default function Loading({ fullScreen = true, size = 40, text = "Đang tải..." }) {
  if (!fullScreen) {
    const s = Math.max(12, size);
    return (
      <span className="inline-loading" style={{ height: s, width: s }} aria-hidden="true">
        <svg viewBox="0 0 50 50" className="inline-spinner" style={{ height: s, width: s }}>
          <circle cx="25" cy="25" r="20" />
        </svg>
      </span>
    );
  }

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        {/* Removed spinner rings - clean design with just car and gear */}
        <div className="spinner-logo">
          <svg width="100" height="80" viewBox="0 0 120 80" fill="none">
            {/* Simple Car Body */}
            <g className="car-body">
              {/* Main body */}
              <rect x="15" y="35" width="50" height="20" rx="3" fill="#1976d2" />
              {/* Cabin */}
              <path d="M25 35 L30 20 L50 20 L55 35 Z" fill="#1976d2" />
              {/* Window */}
              <rect x="32" y="24" width="16" height="8" fill="#e3f2fd" opacity="0.8" />
              
              {/* Rotating Wheels */}
              <g className="wheel-left">
                <circle cx="28" cy="56" r="8" fill="none" stroke="#1565c0" strokeWidth="2" />
                <circle cx="28" cy="56" r="4" fill="#1565c0" />
                <line x1="28" y1="48" x2="28" y2="64" stroke="#e3f2fd" strokeWidth="1.5" />
                <line x1="20" y1="56" x2="36" y2="56" stroke="#e3f2fd" strokeWidth="1.5" />
              </g>
              
              <g className="wheel-right">
                <circle cx="52" cy="56" r="8" fill="none" stroke="#1565c0" strokeWidth="2" />
                <circle cx="52" cy="56" r="4" fill="#1565c0" />
                <line x1="52" y1="48" x2="52" y2="64" stroke="#e3f2fd" strokeWidth="1.5" />
                <line x1="44" y1="56" x2="60" y2="56" stroke="#e3f2fd" strokeWidth="1.5" />
              </g>
            </g>
            
            {/* Gear Icon - rotating */}
            <g className="gear-icon">
              <circle cx="90" cy="40" r="16" fill="none" stroke="#1976d2" strokeWidth="3" />
              {/* Gear teeth */}
              <rect x="88" y="20" width="4" height="6" fill="#1976d2" />
              <rect x="88" y="54" width="4" height="6" fill="#1976d2" />
              <rect x="104" y="38" width="6" height="4" fill="#1976d2" />
              <rect x="70" y="38" width="6" height="4" fill="#1976d2" />
              <rect x="100" y="26" width="5" height="4" transform="rotate(45 102 28)" fill="#1976d2" />
              <rect x="75" y="51" width="5" height="4" transform="rotate(45 77 53)" fill="#1976d2" />
              <rect x="100" y="51" width="5" height="4" transform="rotate(-45 102 53)" fill="#1976d2" />
              <rect x="75" y="26" width="5" height="4" transform="rotate(-45 77 28)" fill="#1976d2" />
              {/* Center */}
              <circle cx="90" cy="40" r="6" fill="#1976d2" />
              <circle cx="90" cy="40" r="3" fill="#e3f2fd" />
            </g>
          </svg>
        </div>
      </div>
      <p className="loading-text">{text}</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
