import React from "react";
import Home from "../../components/Home.jsx";
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";


export default function Homepage() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Home />
      </main>
      <Footer />
    </div>
  );
}