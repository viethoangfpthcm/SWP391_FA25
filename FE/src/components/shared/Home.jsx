import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { motion } from "framer-motion";

const partners = [
  "/VF3.png",
  "/VF5.png",
  "/VF7.png",
  "/VF9.png"
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Trung tâm Dịch vụ Chính hãng – Uy tín & Chuyên nghiệp
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          Chúng tôi là <strong>Trung tâm Dịch vụ được ủy quyền bởi Hãng</strong>,
          cung cấp các giải pháp bảo dưỡng, sửa chữa và hỗ trợ kỹ thuật chính hãng,
          đảm bảo chất lượng, nhanh chóng và minh bạch.
        </motion.p>

        <motion.button
          className="home-btn"
          onClick={() => navigate("/appoint")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4 }}
          style={{ backgroundColor: "#1E90FF", color: "white" }}
        >
          Đặt lịch bảo dưỡng
        </motion.button>
      </section>

      {/* --- Info Section --- */}
      <section className="home-info">
        <div className="info-text">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Dịch vụ chính hãng – Chăm sóc tận tâm
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Tại Trung tâm Dịch vụ Ủy quyền bởi VINFAST, mọi quy trình kiểm tra và bảo trì đều
            tuân thủ tiêu chuẩn của Hãng. Đội ngũ kỹ thuật viên được đào tạo bài bản,
            sử dụng linh kiện chính hãng và công cụ chuyên dụng nhằm đảm bảo an toàn
            và hiệu suất tối ưu cho thiết bị của bạn.
          </motion.p>
        </div>

        <motion.div
          className="info-image"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <img className="VFbrand" src="/VFbrand.png" alt="Authorized Service Center" />
        </motion.div>
      </section>
      <section className="home-partners">
        <h3>Được ủy quyền bởi VINFAST với các dòng xe VF3, VF5, VF7, VF9</h3>
        <div className="partner-carousel">
          <div className="partner-track">
            {partners.concat(partners).map((logo, idx) => (
              <div className="partner-logo" key={idx}>
                <img src={logo} alt={`Partner ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
