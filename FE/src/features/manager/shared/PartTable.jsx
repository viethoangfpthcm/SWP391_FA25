import React from "react";
import Button from "@components/ui/Button.jsx";
import Loading from "@components/ui/Loading.jsx";
import { FaEdit, FaBox, FaExclamationTriangle } from "react-icons/fa";
import "./PartTable.css";

export default function PartTable({
  parts,
  loading,
  actionLoading,
  onEdit,
  onRestockRequest,
}) {
  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { text: "Hết hàng", className: "stock-out" };
    } else if (quantity <= 10) {
      return { text: "Sắp hết", className: "stock-low" };
    }
    return { text: "Còn hàng", className: "stock-ok" };
  };

  if (parts.length === 0) {
    return (
      <div className="no-parts">
        <FaBox size={48} />
        <p>Không có phụ tùng nào</p>
      </div>
    );
  }

  return (
    <div className="part-table-container">
      <table className="part-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên phụ tùng</th>
            <th>Mô tả</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Nhà sản xuất</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => {
            const stockStatus = getStockStatus(part.quantity);
            return (
              <tr key={part.id} className={stockStatus.className}>
                <td>{part.id}</td>
                <td className="part-name">
                  <strong>{part.name}</strong>
                </td>
                <td className="part-description">{part.description}</td>
                <td className="part-price">
                  {part.unitPrice != null 
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(part.unitPrice)
                    : "N/A"}
                </td>
                <td className="part-quantity">
                  <span className={`quantity-badge ${stockStatus.className}`}>
                    {part.quantity}
                  </span>
                </td>
                <td>{part.manufacturer}</td>
                <td>
                  <span className={`stock-status ${stockStatus.className}`}>
                    {part.quantity <= 10 && <FaExclamationTriangle />}
                    {stockStatus.text}
                  </span>
                </td>
                <td className="part-actions">
                  <Button
                    className="btn-edit-part"
                    onClick={() => onEdit(part)}
                    loading={actionLoading === `view-${part.id}`}
                    disabled={!!actionLoading}
                  >
                    <FaEdit /> Chỉnh số lượng
                  </Button>
                  {part.quantity <= 10 && (
                    <Button
                      className="btn-restock"
                      onClick={() => onRestockRequest(part)}
                      disabled={!!actionLoading}
                    >
                      <FaBox /> Nhập hàng
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
