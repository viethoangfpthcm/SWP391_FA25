import React from "react";
import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import "../home/Appoint.css";
export default function Appoint() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="appoint-container">
          <h2 className="appoint-title">ĐẶT LỊCH DỊCH VỤ</h2>
          <form>
            <div className="appoint-row">
              <div>
                <div className="appoint-section-title">
                  <span>1</span> <span>Thông tin khách hàng</span>
                </div>
                <div>
                  <label>Họ và tên <span style={{ color: "red" }}>*</span></label>
                  <input type="text" placeholder="Nhập họ tên" maxLength={80} />
                </div>
                <div>
                  <label>Số điện thoại <span style={{ color: "red" }}>*</span></label>
                  <input type="tel" placeholder="Ít nhất 10 số" />
                </div>
                <div>
                  <label>Email <span style={{ color: "red" }}>*</span></label>
                  <input type="email" placeholder="example@gmail.com" />
                </div>
              </div>
              <div>
                <div className="appoint-section-title">
                  <span>2</span> <span>Thông tin xe</span>
                </div>
                <div>
                  <label>Model xe <span style={{ color: "red" }}>*</span></label>
                  <select>
                    <option>Chọn model</option>
                    <option>VF3</option>
                    <option>VF5</option>
                    <option>VF7</option>
                  </select>
                </div>
                <div>
                  <label>Số km đã đi</label>
                  <input type="number" placeholder="Nhập số km đã đi" />
                </div>
                <div>
                  <label>Biển số xe <span style={{ color: "red" }}>*</span></label>
                  <input type="text" placeholder="Nhập biển số xe" />
                </div>
              </div>
            </div>
            <div className="appoint-row" style={{ marginTop: 32 }}>
              <div>
                <div className="appoint-section-title">
                  <span>3</span> <span>Chi nhánh & Thời gian</span>
                </div>
                <div>
                  <label>Chi nhánh <span style={{ color: "red" }}>*</span></label>
                  <select>
                    <option value="">Chọn chi nhánh</option>
                    <option value="1">123 Lê Văn Việt, TP. Thủ Đức, TP. HCM</option>
                    <option value="2">Đường D2 Khu Công Nghệ Cao</option>
                  </select>
                </div>
                <div>
                  <label>Thời gian <span style={{ color: "red" }}>*</span></label>
                  <div className="appoint-time-row">
                    <input type="date" />
                    <input type="time" />
                  </div>
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