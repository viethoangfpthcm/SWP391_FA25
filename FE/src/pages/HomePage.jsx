import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import Home from "@components/shared/Home.jsx";

export default function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = (localStorage.getItem("role") || "").toLowerCase();
      let defaultPath = "/home";
      switch (role) {
        case "admin":
          defaultPath = "/admin";
          break;
        case "manager":
          defaultPath = "/manager";
          break;
        case "staff":
          defaultPath = "/staff";
          break;
        case "technician":
          defaultPath = "/technicantask";
          break;
        case "customer":
          defaultPath = "/home";
          break;
        default:
          defaultPath = "/home";
          break;
      }

      if (defaultPath !== "/home") {
        navigate(defaultPath, { replace: true });
      }
    }
  }, [navigate]);

  return (
    <div className="home-page">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}
