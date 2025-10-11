import { Routes, Route } from "react-router-dom";
import LoginForm from "./page/login/LoginForm.jsx";
import CheckList from "./page/checkList/CheckList.jsx";
import TechnicanTask from "./page/technican/technicantask.jsx";
import Report1 from "./page/report/report1.jsx"; 
import Report3 from "./page/report/report3.jsx";
import Payment from "./page/payment/payment.jsx";
import Homepage from "./page/home/Homepage.jsx";
import Appoint from "./page/home/Appoint.jsx";
import About from "./page/home/AboutUs.jsx";
import Contact from "./page/home/Contact.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/checklist" element={<CheckList />} />
      <Route path="/technician-task" element={<TechnicanTask />} /> {/* ✅ Sửa tên */}
      <Route path="/report" element={<Report1 />} /> {/* ✅ thêm dòng này */}
      <Route path="/report3" element={<Report3 />} />
       <Route path="/payment" element={<Payment />} /> 
       <Route path="/home" element={<Homepage />} />
       <Route path="/appoint" element={<Appoint />} />
       <Route path="/about" element={<About />} />
       <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;
