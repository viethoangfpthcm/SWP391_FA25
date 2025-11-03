# 📚 Shared Component Usage Guidelines

> **Hướng dẫn sử dụng các component dùng chung trong dự án để đảm bảo tính nhất quán (consistency) về UI/UX**

## 📂 Cấu trúc Components

```
src/components/
├── layout/          # Components bố cục (Navbar, Footer, Sidebar)
├── shared/          # Components trang dùng chung (Home, AboutUs, ProtectedRoute...)
└── ui/              # UI primitives (Button, Loading, ConfirmationModal)
```

---

## 🎨 Layout Components (`layout/`)

### 1. **Sidebar.jsx**

**Khi nào dùng:**
- ✅ **TẤT CẢ** trang dashboard đã xác thực (authenticated pages)
- ✅ Pages của các vai trò: ADMIN, MANAGER, STAFF, TECHNICIAN, CUSTOMER

**Khi nào KHÔNG dùng:**
- ❌ Trang public (home, about, contact)
- ❌ Trang login/register
- ❌ Trang có Navbar/Footer

**Cách dùng:**
```jsx
import Sidebar from "@components/layout/Sidebar.jsx";

<Sidebar
  sidebarOpen={true}
  userName={userInfo?.fullName}
  userRole={userInfo?.role}
/>
```

**Props:**
- `sidebarOpen` (boolean): Trạng thái mở/đóng sidebar
- `userName` (string): Tên người dùng hiển thị
- `userRole` (string): Vai trò để hiển thị menu phù hợp

---

### 2. **Navbar.jsx**

**Khi nào dùng:**
- ✅ Trang public (HomePage, AboutUs, Contact)
- ✅ Trang customer chưa đăng nhập
- ✅ **LUÔN LUÔN đi kèm với Footer**

**Khi nào KHÔNG dùng:**
- ❌ Pages đã có Sidebar
- ❌ Dashboard pages

**Cách dùng:**
```jsx
import Navbar from "@components/layout/Navbar.jsx";
import Footer from "@components/layout/Footer.jsx";

<div>
  <Navbar />
  {/* Page content */}
  <Footer />
</div>
```

---

### 3. **Footer.jsx**

**Khi nào dùng:**
- ✅ **LUÔN LUÔN đi kèm với Navbar**
- ✅ Trang public

**Quy tắc:**
- Navbar và Footer **PHẢI** đi cùng nhau
- Nếu có Navbar thì PHẢI có Footer

---

## 🧩 UI Primitives (`ui/`)

### 1. **Button.jsx**

**Khi nào dùng:**
- ✅ **LUÔN LUÔN** thay thế cho `<button>` native
- ✅ Tất cả các form submit
- ✅ Tất cả các action buttons (Save, Delete, Edit, etc.)

**Khi nào KHÔNG dùng:**
- ❌ Không bao giờ dùng `<button>` trực tiếp

**Cách dùng:**
```jsx
import Button from "@components/ui/Button.jsx";

<Button
  loading={isLoading}
  disabled={isDisabled}
  onClick={handleClick}
  className="btn-primary"
>
  Lưu thay đổi
</Button>
```

**Props:**
- `loading` (boolean): Hiển thị spinner khi đang xử lý
- `disabled` (boolean): Vô hiệu hóa button
- `onClick` (function): Handler khi click
- `className` (string): Custom CSS class
- `children` (ReactNode): Nội dung button

**Best practices:**
- Luôn set `loading={true}` khi submit form hoặc API call
- Luôn set `disabled={true}` khi button không khả dụng

---

### 2. **Loading.jsx**

**Khi nào dùng:**
- ✅ Khi đang fetch data từ API
- ✅ Khi đang submit form
- ✅ Khi chuyển trang cần load dữ liệu

**Cách dùng:**

**Full screen loading:**
```jsx
import Loading from "@components/ui/Loading.jsx";

if (loading) {
  return <Loading />;
}
```

**Inline loading:**
```jsx
<Loading inline />
```

**Props:**
- `inline` (boolean): `true` = inline spinner, `false`/undefined = fullscreen

**Best practices:**
- Dùng fullscreen loading cho initial page load
- Dùng inline loading cho partial updates (e.g., loading một table)
- Luôn có state `loading` trong component khi fetch API:

```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

if (loading) return <Loading />;
```

---

### 3. **ConfirmationModal.jsx**

**Khi nào dùng:**
- ✅ **BẮT BUỘC** trước khi thực hiện hành động phá hoại (destructive actions)
- ✅ Trước khi DELETE (xóa user, part, booking, etc.)
- ✅ Trước khi DEACTIVATE hoặc CANCEL
- ✅ Trước khi thay đổi KHÔNG THỂ hoàn tác

**Khi nào KHÔNG dùng:**
- ❌ Edit/Update operations (không phá hoại)
- ❌ View operations
- ❌ Navigation

**Cách dùng:**
```jsx
import ConfirmationModal from "@components/ui/ConfirmationModal.jsx";

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [itemToDelete, setItemToDelete] = useState(null);

const handleDeleteClick = (item) => {
  setItemToDelete(item);
  setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
  await api.delete(itemToDelete.id);
  setShowDeleteModal(false);
  setItemToDelete(null);
};

{showDeleteModal && (
  <ConfirmationModal
    title="Xác nhận xóa"
    message={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}"? Hành động này không thể hoàn tác.`}
    onConfirm={handleConfirmDelete}
    onCancel={() => {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }}
    confirmText="Xóa"
    cancelText="Hủy"
  />
)}
```

**Props:**
- `title` (string): Tiêu đề modal
- `message` (string): Nội dung cảnh báo
- `onConfirm` (function): Handler khi xác nhận
- `onCancel` (function): Handler khi hủy
- `confirmText` (string): Text nút xác nhận (mặc định: "Xác nhận")
- `cancelText` (string): Text nút hủy (mặc định: "Hủy")

**Best practices:**
- Luôn hiển thị tên item sẽ bị xóa trong message
- Luôn nhấn mạnh "Hành động này không thể hoàn tác"
- Dùng text rõ ràng: "Xóa" thay vì "OK"

---

## 🔄 Shared Page Components (`shared/`)

### 1. **ProtectedRoute.jsx**

**Khi nào dùng:**
- ✅ Wrap tất cả các routes yêu cầu authentication
- ✅ Trong App.jsx routing configuration

**Cách dùng:**
```jsx
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

---

### 2. **Home.jsx, AboutUs.jsx, Appoint.jsx**

- Page-level components cho public pages
- Dùng trong App.jsx routing
- Không import trực tiếp trong features

---

### 3. **VnPayPaymentButton.jsx**

- Component tích hợp thanh toán VNPay
- Dùng trong pages cần payment gateway

---

## ✅ Checklist Tạo Feature Mới

Khi tạo một feature/page mới, đảm bảo:

### Dashboard Pages (Authenticated):
- [ ] Import và sử dụng `Sidebar`
- [ ] Import và sử dụng `Loading` (cho initial load)
- [ ] Dùng `Button` thay vì `<button>`
- [ ] Dùng `ConfirmationModal` cho delete operations
- [ ] **KHÔNG** dùng Navbar/Footer

### Public Pages:
- [ ] Import và sử dụng `Navbar`
- [ ] Import và sử dụng `Footer`
- [ ] Dùng `Button` cho tất cả buttons
- [ ] **KHÔNG** dùng Sidebar

### Form Components:
- [ ] Dùng `Button` với prop `loading` khi submit
- [ ] Dùng `Loading` inline nếu form data đang load
- [ ] Validate input trước khi submit

### Delete/Destructive Actions:
- [ ] **BẮT BUỘC** dùng `ConfirmationModal`
- [ ] Hiển thị tên item trong modal message
- [ ] Clear state sau khi xác nhận

---

## 🚨 Common Mistakes (Lỗi thường gặp)

### ❌ KHÔNG NÊN:
```jsx
// 1. Dùng <button> trực tiếp
<button onClick={handleSave}>Save</button>

// 2. Không có ConfirmationModal khi delete
<button onClick={() => deleteUser(userId)}>Delete</button>

// 3. Không có Loading state
const fetchData = async () => {
  const data = await api.getData(); // NO loading indicator!
  setData(data);
};

// 4. Dùng Sidebar + Navbar cùng lúc
<Sidebar />
<Navbar /> // ❌ Conflict!
```

### ✅ NÊN:
```jsx
// 1. Dùng Button component
<Button loading={isSubmitting} onClick={handleSave}>
  Save
</Button>

// 2. Có ConfirmationModal
<ConfirmationModal
  title="Xác nhận xóa"
  message="Bạn có chắc chắn?"
  onConfirm={handleDelete}
  onCancel={() => setShowModal(false)}
/>

// 3. Có Loading state
const [loading, setLoading] = useState(true);
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};
if (loading) return <Loading />;

// 4. Chỉ dùng Sidebar HOẶC Navbar
// Dashboard page:
<Sidebar />

// Public page:
<Navbar />
<Footer />
```

---

## 📊 Component Usage Summary

| Component | Usage Count | Where Used |
|-----------|-------------|------------|
| **Sidebar** | 20+ pages | All authenticated dashboards |
| **Button** | 30+ places | Forms, actions, navigation |
| **Loading** | 15+ pages | Data fetching, submissions |
| **ConfirmationModal** | 5+ places | Admin/Manager delete operations |
| **Navbar** | 8 pages | Public pages, customer pages |
| **Footer** | 7 pages | Always with Navbar |

---

## 🎯 Goals

- **100% Consistency**: Tất cả pages dùng chung shared components
- **Better UX**: Loading states, confirmations cho destructive actions
- **Maintainability**: Thay đổi một nơi, apply cho toàn bộ app
- **Code Quality**: Reduce duplication, follow best practices

---

## 📝 Notes

- File này là **living document** - cập nhật khi có component mới
- Review file này khi onboard developer mới
- Enforce guidelines trong code review
- Tham khảo `components/ui/USAGE.md` cho UI component details

---

**Cập nhật lần cuối:** November 3, 2025  
**Người tạo:** Development Team  
**Version:** 1.0
