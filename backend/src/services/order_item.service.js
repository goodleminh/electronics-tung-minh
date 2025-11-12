import { OrderItem } from '../models/order_item.model.js';

// Lấy tất cả order items
export const getAllOrderItems = async () => {
  const items = await OrderItem.findAll();
  return items;
};

// Lấy theo ID
export const getOrderItemById = async (id) => {
  const item = await OrderItem.findByPk(id);
  return item;
};

// Lấy theo order_id
export const getItemsByOrderId = async (orderId) => {
  const items = await OrderItem.findAll({ where: { order_id: orderId } });
  return items;
};

// Tạo mới
export const createOrderItem = async (data) => {
  const newItem = await OrderItem.create(data);
  return newItem;
};

// Cập nhật
export const updateOrderItem = async (id, data) => {
  const item = await OrderItem.findByPk(id);
  if (!item) return null;
  await item.update(data);
  return item;
};

// Xoá
export const deleteOrderItem = async (id) => {
  const item = await OrderItem.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return item;
};
