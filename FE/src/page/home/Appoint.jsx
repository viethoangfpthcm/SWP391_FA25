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

  const [serviceCenters] = useState([
    { id: 4, name: "EV Center 1", address: "25 Nguyễn Huệ, Quận 1, TP.HCM" },
    { id: 6, name: "EV Center 2", address: "12 Võ Văn Ngân, Thủ Đức, TP.HCM" },
    { id: 5, name: "EV Center 3", address: "200 Nguyễn Văn Cừ, Quận 5, TP.HCM" },
  ]);

  const [selectedCenter, setSelectedCenter] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) return;

    setCustomerInfo((prev) => ({ ...prev, userId }));

    // Load customer info + vehicles
    fetch(`http://localhost:8080/api/customer/dashboard/${userId}`, {
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

    console.log("Payload submit:", payload); // Debug payload

    try {
      const res = await fetch("http://localhost:8080/api/customer/bookings", {
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

      // Reset form
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
                <div className="appoint-section-title">
                  <span>1</span> <span>Thông tin khách hàng</span>
                </div>
                <div>
                  <label>
                    Họ và tên <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>
                    Số điện thoại <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>
                    Email <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Thông tin xe */}
              <div>
                <div className="appoint-section-title">
                  <span>2</span> <span>Thông tin xe</span>
                </div>
                <div>
                  <label>
                    Xe<span style={{ color: "red" }}>*</span>
                  </label>
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
                    <label>Biển số xe</label>
                    <input type="text" value={licensePlate} readOnly />
                  </div>
                )}
              </div>
            </div>

            {/* Chi nhánh & thời gian */}
            <div className="appoint-row" style={{ marginTop: 32 }}>
              <div>
                <div className="appoint-section-title">
                  <span>3</span> <span>Chi nhánh & Thời gian</span>
                </div>
                <div>
                  <label>
                    Chi nhánh <span style={{ color: "red" }}>*</span>
                  </label>
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
                </div>
                <div>
                  <label>
                    Thời gian <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="appoint-time-row">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label>Ghi chú</label>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button type="submit" className="appoint-submit-btn">
                Đặt lịch
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
