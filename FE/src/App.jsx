import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "./components/Loading.jsx";

// import các trang
import LoginForm from "./page/login/LoginForm.jsx";
import CheckList from "./page/checkList/CheckList.jsx";
import TechnicanTask from "./page/technican/technicantask.jsx";
import Report1 from "./page/report/report1.jsx";
import Report3 from "./page/report/report3.jsx";
import Homepage from "./page/home/Homepage.jsx";
import Appoint from "./page/home/Appoint.jsx";
import About from "./page/home/AboutUs.jsx";
import Contact from "./page/home/Contact.jsx";
import StaffDashboard from "./page/staff/StaffDashboard.jsx";
import PaymentReady from "./page/payment/PaymentReady.jsx";
import PaymentProcess from "./page/payment/PaymentProcess.jsx";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Khi route thay đổi -> hiển thị loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); // giả lập delay 1s
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loading />}
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/checklist" element={<CheckList />} />
        <Route path="/technician-task" element={<TechnicanTask />} />
        <Route path="/report" element={<Report1 />} />
        <Route path="/report3" element={<Report3 />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/appoint" element={<Appoint />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/payment/ready" element={<PaymentReady />} />
        <Route path="/payment/process/:id" element={<PaymentProcess />} />
      </Routes>
    </>
  );
}

export default App;
