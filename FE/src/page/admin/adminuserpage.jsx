import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", phone: "", password: "", role: "STAFF", centerId: 1 });

  // 📦 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 👁️ Xem thông tin chi tiết
  const handleView = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // ➕ Thêm người dùng
  const handleAdd = async () => {
    try {
      await axios.post("/api/admin/users-create", newUser);
      fetchUsers();
      setNewUser({ fullName: "", email: "", phone: "", password: "", role: "STAFF", centerId: 1 });
      alert("Thêm người dùng thành công!");
    } catch (err) {
      console.error(err);
    }
  };

  // 🗑️ Xóa người dùng
  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ✏️ Cập nhật thông tin người dùng
  const handleUpdate = async (userId, updatedData) => {
    try {
      await axios.put(`/api/admin/users-update?userIdToUpdate=${userId}`, updatedData);
      fetchUsers();
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button onClick={handleAdd} className="flex gap-2">
          <Plus size={18} /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trung tâm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.centerName}</td>
                  <td className="flex gap-2 mt-1">
                    <Button size="sm" variant="outline" onClick={() => handleView(u)}>
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdate(u.userId, { fullName: u.fullName })}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(u.userId)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 🔍 Popup xem thông tin */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-2 space-y-2 text-sm">
              <p><b>ID:</b> {selectedUser.userId}</p>
              <p><b>Họ tên:</b> {selectedUser.fullName}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Điện thoại:</b> {selectedUser.phone}</p>
              <p><b>Vai trò:</b> {selectedUser.role}</p>
              <p><b>Trung tâm:</b> {selectedUser.centerName}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ➕ Form thêm người dùng */}
      <div className="mt-8 border-t pt-4">
        <h2 className="font-semibold mb-2">Thêm người dùng mới</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Họ và tên"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            placeholder="Số điện thoại"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
          <Input
            placeholder="Mật khẩu"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <Input
            placeholder="Role (ADMIN / STAFF / TECH)"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
