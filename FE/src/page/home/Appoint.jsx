import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import "../home/Appoint.css";

export default function Appoint() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    userId: "",
  });

  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) return;

    setCustomerInfo((prev) => ({ ...prev, userId }));

    // Gọi API dashboard customer
    fetch(`http://localhost:8080/api/customer/dashboard/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Lấy dữ liệu dashboard thất bại");
        }
        return res.json();
      })
      .then((data) => {
        // Giả sử API trả về data.customerInfo + data.vehicles
        if (data.customerInfo) {
          setCustomerInfo({
            fullName: data.customerInfo.fullName,
            phone: data.customerInfo.phone,
            email: data.customerInfo.email,
            userId: data.customerInfo.userId,
          });
        }

        if (data.vehicles) setVehicles(data.vehicles);
      })
      .catch((err) => console.log("Fetch dashboard error:", err.message));
  }, []);

  const handleVehicleChange = (e) => {
    const license = e.target.value;
    setSelectedVehicle(license);

    const vehicle = vehicles.find((v) => v.licensePlate === license);
    setLicensePlate(vehicle ? vehicle.licensePlate : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return alert("Vui lòng chọn xe!");
    if (!branch || !date || !time) return alert("Vui lòng chọn chi nhánh và thời gian!");

    const token = localStorage.getItem("token");
    const payload = {
      customerInfo,
      vehicle: vehicles.find((v) => v.licensePlate === selectedVehicle),
      branch,
      date,
      time,
    };

    try {
      const res = await fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Đặt lịch thất bại!");
      }
      alert("Đặt lịch thành công!");
      setSelectedVehicle("");
      setLicensePlate("");
      setBranch("");
      setDate("");
      setTime("");
    } catch (err) {
      console.log("Submit error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="appoint-container">
          <h2 className="appoint-title">ĐẶT LỊCH DỊCH VỤ</h2>
          <form onSubmit={handleSubmit}>
            {/* Thông tin khách hàng */}
            <div className="appoint-row">
              <div>
                <div className="appoint-section-title"><span>1</span> <span>Thông tin khách hàng</span></div>
                <div>
                  <label>Họ và tên <span style={{ color: "red" }}>*</span></label>
                  <input type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                    maxLength={80} required />
                </div>
                <div>
                  <label>Số điện thoại <span style={{ color: "red" }}>*</span></label>
                  <input type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    required />
                </div>
                <div>
                  <label>Email <span style={{ color: "red" }}>*</span></label>
                  <input type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required />
                </div>
              </div>

              {/* Thông tin xe */}
              <div>
                <div className="appoint-section-title"><span>2</span> <span>Thông tin xe</span></div>
                <div>
                  <label>Xe<span style={{ color: "red" }}>*</span></label>
                  <select value={selectedVehicle} onChange={handleVehicleChange} required>
                    <option value="">Chọn xe của bạn</option>
                    {vehicles.map((v) => (
                      <option key={v.licensePlate} value={v.licensePlate}>
                        {v.model} - {v.licensePlate}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedVehicle && (
                  <div>
                    <label>Biển số xe <span style={{ color: "red" }}>*</span></label>
                    <input type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      required />
                  </div>
                )}
              </div>
            </div>

            {/* Chi nhánh & Thời gian */}
            <div className="appoint-row" style={{ marginTop: 32 }}>
              <div>
                <div className="appoint-section-title"><span>3</span> <span>Chi nhánh & Thời gian</span></div>
                <div>
                  <label>Chi nhánh <span style={{ color: "red" }}>*</span></label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
                    <option value="">Chọn chi nhánh</option>
                    <option value="1">123 Lê Văn Việt, TP. Thủ Đức, TP. HCM</option>
                    <option value="2">Đường D2 Khu Công Nghệ Cao</option>
                  </select>
                </div>
                <div>
                  <label>Thời gian <span style={{ color: "red" }}>*</span></label>
                  <div className="appoint-time-row">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button type="submit" className="appoint-submit-btn">Đặt lịch</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
