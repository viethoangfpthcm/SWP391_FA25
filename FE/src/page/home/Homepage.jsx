import React from "react";
import Home from "../components/Home";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


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