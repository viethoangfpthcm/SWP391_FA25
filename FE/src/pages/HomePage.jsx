import React from "react";
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";
import Home from "@components/shared/Home.jsx";

export default function Homepage() {
  return (
    <div className="home-page">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}
