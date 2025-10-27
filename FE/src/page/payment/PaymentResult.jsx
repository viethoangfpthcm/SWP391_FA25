import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './PaymentResult.css';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const responseCode = searchParams.get('vnp_ResponseCode');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const amount = searchParams.get('vnp_Amount') ? Number(searchParams.get('vnp_Amount')) / 100 : 0; // VNPay trả về số tiền * 100
  const isSuccess = responseCode === '00';
  const token = localStorage.getItem('token');
  const customerId = localStorage.getItem('userId');
  const API_BASE = 'https://103.90.226.216:8443';

  // Cập nhật danh sách reports khi thanh toán thành công
  useEffect(() => {
    if (isSuccess && token && customerId) {
      const fetchReportsList = async () => {
        try {
          const listUrl = `${API_BASE}/api/customer/maintenance/checklists?customerId=${encodeURIComponent(customerId)}`;
          const response = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });
          if (response.ok) {
            const data = await response.json();
            const processedData = data
              .filter(r => r.status !== 'COMPLETED')
              .sort((a, b) => (b.createdDate ? new Date(b.createdDate) : 0) - (a.createdDate ? new Date(a.createdDate) : 0));
            // Lưu vào localStorage hoặc context nếu cần
            console.log('Danh sách reports cập nhật:', processedData);
          }
        } catch (err) {
          console.error('Lỗi tải danh sách reports:', err);
        }
      };
      fetchReportsList();
    }

    // // Tự động chuyển hướng sau 5 giây
    // const timer = setTimeout(() => {
    //   navigate('/report1'); // 
    // }, 5000);

    // return () => clearTimeout(timer);
  }, [navigate, isSuccess, token, customerId]);

  // Kiểm tra token và redirect nếu không đăng nhập
  useEffect(() => {
    if (!token || !customerId) {
      navigate('/');
    }
  }, [token, customerId, navigate]);

  return (
    <div className="payment-result-page">
      <Navbar />
      <main className="payment-result-container" aria-live="polite">
        <div className="payment-result-card">
          {isSuccess ? (
            <>
              <FaCircleCheck className="icon-success" />
              <h1>Thanh toán thành công!</h1>
              <p>Số giao dịch: {transactionNo || 'N/A'}</p>
              <p>Số tiền: {amount.toLocaleString('vi-VN')} đ</p>
              <p>Cảm ơn bạn đã hoàn tất thanh toán. Đặt lịch của bạn đã được xác nhận và cập nhật.</p>
              <p>Bạn sẽ được tự động chuyển về danh sách biên bản sau 5 giây...</p>
            </>
          ) : (
            <>
              <FaCircleXmark className="icon-fail" />
              <h1>Thanh toán thất bại</h1>
              <p>Mã lỗi: {responseCode || 'Không xác định'}</p>
              <p>Đã xảy ra lỗi trong quá trình xử lý thanh toán hoặc bạn đã hủy giao dịch. Vui lòng thử lại sau.</p>
              <p>Bạn sẽ được tự động chuyển về danh sách biên bản sau 5 giây...</p>
            </>
          )}
          <button
            className={`btn-back ${isSuccess ? 'btn-success' : 'btn-fail'}`}
            onClick={() => navigate('/report1')}
            aria-label="Quay lại danh sách biên bản"
          >
            Về danh sách biên bản
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}