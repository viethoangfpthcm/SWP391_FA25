# Quick Deploy Guide

## ✅ Đã fix xong lỗi API

**Vấn đề:** Frontend đang gọi API sai port (3000 thay vì 8443)
**Giải pháp:** Đã sửa tất cả 17 files để dùng `VITE_API_URL` từ `.env`

## 🚀 Upload lên server 103

### Option 1: Dùng WinSCP/FileZilla (GUI - Đơn giản nhất)

1. Mở WinSCP hoặc FileZilla
2. Kết nối đến:
   - Host: `103.90.226.216`
   - Port: `22`
   - Username: `root` (hoặc user của bạn)
   - Password: (nhập password)
3. Upload toàn bộ folder `dist/` lên `/var/www/frontend/` (ghi đè files cũ)
4. Xong! Refresh browser: `http://103.90.226.216:3000/admin`

### Option 2: Dùng SCP (Command line)

```powershell
# Upload từ máy Windows
cd d:\SWP391_FA25\FE
scp -r dist\* root@103.90.226.216:/var/www/frontend/
```

### Option 3: Dùng Git (Nếu server có clone repo)

```bash
# Trên server 103
cd /path/to/SWP391_FA25/FE
git pull origin fe
npm install
npm run build
cp -r dist/* /var/www/frontend/
```

## 🔍 Test sau khi deploy

1. Mở browser: `http://103.90.226.216:3000/admin`
2. Đăng nhập
3. Mở DevTools → Console → Không còn lỗi "Unexpected token"
4. Mở DevTools → Network → API calls sẽ gọi đến `https://103.90.226.216:8443/api/...`

## 📝 Những gì đã fix

- ✅ Fix 17 files để dùng `VITE_API_URL` từ `.env`
- ✅ Fix `.env` để gọi đúng `https://103.90.226.216:8443`
- ✅ Thêm Content-Type checking trong `AdminDashboard.jsx`
- ✅ Build thành công

## 🆘 Nếu vẫn lỗi

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl https://103.90.226.216:8443/api/users/account/current
   ```

2. **Kiểm tra CORS:** Backend phải cho phép origin `http://103.90.226.216:3000`

3. **Clear cache browser:** Ctrl+Shift+Delete → Clear cache → Refresh

4. **Check Nginx logs:**
   ```bash
   ssh root@103.90.226.216
   sudo tail -f /var/log/nginx/error.log
   ```
