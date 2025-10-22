import React from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import Home from "../../components/Home.jsx";

export default function Homepage() {
  return (
    <div className="home-page">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}
