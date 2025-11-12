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
  const newOrder = await Order.create(orderData);
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
