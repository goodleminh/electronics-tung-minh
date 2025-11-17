import { Order } from "../models/order.model.js";

// lấy tất cả đơn hàng
export const getAllOrders = async () => {
  const orders = await Order.findAll();
  return orders;
};
// lấy đơn hàng theo id người dùng
export const getOrdersByBuyerId = async (buyerId) => {
  const orders = await Order.findAll({ where: { buyer_id: buyerId } });
  return orders;
};
// lấy đơn hàng theo ID
export const getOrderById = async (id) => {
  const order = await Order.findByPk(id);
  return order;
};
// tạo đơn hàng mới
export const createOrder = async (orderData) => {
  // Sinh mã order_code tự động
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const dateStr =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  let order_code = `ORD-${dateStr}-${randomStr}`;

  // Đảm bảo order_code là duy nhất
  while (await Order.findOne({ where: { order_code } })) {
    order_code = `ORD-${dateStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  const newOrder = await Order.create({ ...orderData, order_code });
  return newOrder;
};
// sửa thông tin đơn hàng
export const updateOrder = async (id, orderData) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new Error("Order not found");
  }
  await order.update(orderData);
  return order;
};
// xoá đơn hàng
export const deleteOrder = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) {
    throw new Error("Order not found");
  }
  await order.destroy();
  return order;
};
