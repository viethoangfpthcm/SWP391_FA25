import { useEffect, useState } from "react";
import "./payment.css";

export default function Payment() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Giả lập API từ backend
    const fetchData = async () => {
      const demoData = {
        orderId: "ORD-001",
        vehicle: "VinFast VF8 Plus - 30A-12345",
        service: "Bảo dưỡng định kỳ 15,000km",
        completedAt: "2025-09-22",
        customer: "Nguyễn Văn A",
        receiver: "Phạm Văn C",
        pickupLocation: "EV Service Center Hà Nội, 123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
        phone: "024-3456-7890",
        time: "2025-09-22 16:00",
        warranty: {
          parts: 12,
          labor: 6,
          validUntil: "2026-09-22",
        },
        itemsDone: [
          { name: "Kiểm tra dung lượng pin", code: "VF-010", cost: 850000 },
          { name: "Thay má phanh trước", code: "VF-012", cost: 1200000 },
        ],
        skippedItems: [{ name: "Thay dầu phanh", code: "VF-013", cost: 450000 }],
        payment: {
          parts: 1200000,
          labor: 850000,
          total: 2050000,
        },
      };
      setTimeout(() => setData(demoData), 500);
    };
    fetchData();
  }, []);

  if (!data) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="payment-container">
      <header className="header">
        <h2>EV Service Center</h2>
        <nav>
          <a href="#">Trang chủ</a>
          <a href="#">Liên hệ</a>
          <a href="#" className="active">Bảng điều khiển</a>
          <a href="#">Theo dõi</a>
        </nav>
        <div className="user-info">Xin chào, {data.customer}</div>
      </header>

      <main className="content">
        <section className="order-info">
          <h3>Đơn hàng đã hoàn thành - {data.orderId}</h3>
          <div className="order-detail">
            <p><strong>Xe:</strong> {data.vehicle}</p>
            <p><strong>Dịch vụ:</strong> {data.service}</p>
            <p><strong>Hoàn thành:</strong> {data.completedAt}</p>
          </div>
        </section>

        <div className="grid">
          <section className="handover">
            <h4>Bàn giao xe</h4>
            <div className="handover-box">
              <p><strong>Địa điểm nhận xe:</strong><br />{data.pickupLocation}<br />📞 {data.phone}</p>
              <p><strong>Thời gian:</strong> {data.time}</p>
              <p><strong>Kỹ thuật viên:</strong> {data.receiver}</p>
              <div className="status">✅ Xe đã được bàn giao trong tình trạng tốt</div>
            </div>
          </section>

          <section className="payment">
            <h4>Thanh toán</h4>
            <div className="payment-box">
              <p>Chi phí phụ tùng: <span>{data.payment.parts.toLocaleString()}đ</span></p>
              <p>Chi phí công lao động: <span>{data.payment.labor.toLocaleString()}đ</span></p>
              <p className="total">Tổng thanh toán: <strong>{data.payment.total.toLocaleString()}đ</strong></p>

              <div className="payment-methods">
                <label><input type="radio" name="method" /> Tiền mặt</label>
                <label><input type="radio" name="method" /> Chuyển khoản</label>
                <label><input type="radio" name="method" /> Thẻ tín dụng</label>
                <label><input type="radio" name="method" /> Ví điện tử</label>
              </div>

              <button className="btn-pay">Thanh toán {data.payment.total.toLocaleString()}đ</button>
              <div className="warning">⚠️ Vui lòng xác nhận đã nhận xe</div>
            </div>
          </section>
        </div>

        <section className="service-detail">
          <h4>Chi tiết dịch vụ đã thực hiện</h4>

          <div className="done">
            <h5>Hạng mục đã thực hiện ({data.itemsDone.length})</h5>
            {data.itemsDone.map((item, i) => (
              <div className="service-item done-item" key={i}>
                <span>{item.name}</span>
                <span>{item.cost.toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="skipped">
            <h5>Hạng mục đã bỏ qua ({data.skippedItems.length})</h5>
            {data.skippedItems.map((item, i) => (
              <div className="service-item skipped-item" key={i}>
                <span>{item.name}</span>
                <span>{item.cost.toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="warranty">
            <h5>Thông tin bảo hành</h5>
            <p>Bảo hành phụ tùng: {data.warranty.parts} tháng</p>
            <p>Bảo hành công lao động: {data.warranty.labor} tháng</p>
            <p>Hết hạn: {data.warranty.validUntil}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
