import { Routes, Route } from "react-router-dom";
import LoginForm from "./page/login/LoginForm.jsx";
import CheckList from "./page/checkList/CheckList.jsx";
import TechnicanTask from "./page/technican/technicantask.jsx";
import Report1 from "./page/report/report1.jsx"; 
import Report3 from "./page/report/report3.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/checklist" element={<CheckList />} />
      <Route path="/technician-task" element={<TechnicanTask />} /> {/* ✅ Sửa tên */}
      <Route path="/report" element={<Report1 />} /> {/* ✅ thêm dòng này */}
      <Route path="/report3" element={<Report3 />} />
    </Routes>
  );
}

export default App;
