import React, { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import {
  FaClipboardList,
  FaClock,
  FaTools,
  FaCheckCircle,
  FaCreditCard,
  FaCar
} from "react-icons/fa";
import "../home/Appoint.css";

export default function Appoint() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    userId: "",
  });

  const [serviceCenters] = useState([
      { id: 1, name: "EV Center 1", address: "25 Nguyễn Huệ, Quận 1, TP.HCM", phone: "0787052810" },
      { id: 2, name: "EV Center 2", address: "12 Võ Văn Ngân, Thủ Đức, TP.HCM", phone: "0787052811" },
      { id: 3, name: "EV Center 3", address: "200 Nguyễn Văn Cừ, Quận 5, TP.HCM", phone: "0787052812" },
    ]);

  const [selectedCenter, setSelectedCenter] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const formRef = useRef(null);

  useEffect(() => {
    if (!token || !userId) return;

    setCustomerInfo((prev) => ({ ...prev, userId }));

    fetch(`https://103.90.226.216:8443/api/customer/dashboard/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.customerInfo) setCustomerInfo(data.customerInfo);
        if (data.vehicles) setVehicles(data.vehicles);
      })
      .catch((err) => console.log("Fetch dashboard error:", err.message));
  }, [token, userId]);

  const handleVehicleChange = (e) => {
    const license = e.target.value;
    setSelectedVehicle(license);
    const vehicle = vehicles.find((v) => v.licensePlate === license);
    setLicensePlate(vehicle ? vehicle.licensePlate : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedCenter || !date || !time) {
      return alert("Vui lòng điền đầy đủ thông tin!");
    }

    const bookingDate = new Date(`${date}T${time}`).toISOString();
    const payload = {
      userId,
      vehiclePlate: selectedVehicle,
      centerId: parseInt(selectedCenter),
      bookingDate,
      note,
    };

    try {
      const res = await fetch("https://103.90.226.216:8443/api/customer/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      const newBooking = await res.json();
      alert(`Đặt lịch thành công! Mã booking: ${newBooking.bookingId}`);

      setSelectedVehicle("");
      setLicensePlate("");
      setSelectedCenter("");
      setDate("");
      setTime("");
      setNote("");
    } catch (err) {
      console.log("Submit booking error:", err.message);
      alert(err.message);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const steps = [
    { icon: <FaClipboardList />, title: "Đặt lịch Online", desc: "Chọn thời gian và thông tin xe của bạn." },
    { icon: <FaClock />, title: "Xác nhận & Nhận xe", desc: "Xác nhận lịch hẹn và đến trung tâm." },
    { icon: <FaTools />, title: "Bảo dưỡng chuyên sâu", desc: "Vệ sinh, kiểm tra và tối ưu hệ thống." },
    { icon: <FaCheckCircle />, title: "Kiểm tra & Báo cáo", desc: "Nhận báo cáo chi tiết tình trạng xe." },
    { icon: <FaCreditCard />, title: "Thanh toán linh hoạt", desc: "Thanh toán online hoặc trực tiếp." },
    { icon: <FaCar />, title: "Giao xe hoàn tất", desc: "Nhận xe đã hoàn thiện và bảo hành." },
  ];

  return (
    <div className="appoint-page">
      <Navbar />

      {/* Section 1: Giới thiệu */}
      <section className="appoint-intro">
        <h1>Dịch vụ bảo dưỡng xe điện chuyên nghiệp</h1>
        <p>
          Từ đặt lịch online đến kiểm tra, bảo dưỡng và thanh toán – mọi thứ được tối ưu cho trải nghiệm tốt nhất.
        </p>

        <div className="appoint-steps">
          {steps.map((s, i) => (
            <div key={i} className="appoint-step-card">
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <button className="scroll-btn" onClick={scrollToForm}>
          Đặt lịch ngay
        </button>
      </section>

      {/* Section 2: Form */}
      <main ref={formRef} className="appoint-form-section">
        <div className="appoint-container">
          <h2>Đặt lịch dịch vụ</h2>
          <form onSubmit={handleSubmit}>
            <div className="appoint-row">
              <div>
                <h4>1. Thông tin khách hàng</h4>
                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, fullName: e.target.value })
                  }
                  required
                />
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  required
                />
                <label>Email *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <h4>2. Thông tin xe</h4>
                <label>Xe *</label>
                <select value={selectedVehicle} onChange={handleVehicleChange} required>
                  <option value="">Chọn xe của bạn</option>
                  {vehicles.map((v) => (
                    <option key={v.licensePlate} value={v.licensePlate}>
                      {v.model} - {v.licensePlate}
                    </option>
                  ))}
                </select>

                {selectedVehicle && (
                  <>
                    <label>Biển số xe</label>
                    <input type="text" value={licensePlate} readOnly />
                  </>
                )}
              </div>
            </div>

            <div className="appoint-row" style={{ marginTop: 32 }}>
              <div>
                <h4>3. Chi nhánh & Thời gian</h4>
                <label>Chi nhánh *</label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  required
                >
                  <option value="">Chọn chi nhánh</option>
                  {serviceCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.address}
                    </option>
                  ))}
                </select>

                <label>Thời gian *</label>
                <div className="appoint-time-row">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <label>Ghi chú</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="appoint-btn-container">
              <button type="submit">Xác nhận đặt lịch</button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
