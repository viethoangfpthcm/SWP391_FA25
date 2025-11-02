import React from "react";
import "./Button.css";

export default function Button({ children, loading = false, className = "", ...props }) {
  return (
    <button className={`app-btn ${className}`} {...props} disabled={loading || props.disabled}>
      {loading ? <span className="btn-loading"><svg viewBox="0 0 50 50" className="spinner" aria-hidden="true"><circle cx="25" cy="25" r="20" /></svg></span> : children}
    </button>
  );
}
