import * as orderItemService from '../services/order_item.service.js';

// Lấy tất cả
export const getAllOrderItems = async (req, res) => {
  try {
    const items = await orderItemService.getAllOrderItems();
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Lấy theo ID
export const getOrderItemById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const item = await orderItemService.getOrderItemById(id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });
    return res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Lấy theo order_id
export const getItemsByOrderId = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: 'Invalid order id' });
    const items = await orderItemService.getItemsByOrderId(orderId);
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Tạo
export const createOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity, price } = req.body;
    if (!order_id || !product_id || !quantity || !price) {
      return res.status(400).json({ message: 'order_id, product_id, quantity, price là bắt buộc' });
    }
    const created = await orderItemService.createOrderItem({ order_id, product_id, quantity, price });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Cập nhật
export const updateOrderItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const updated = await orderItemService.updateOrderItem(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Order item not found' });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Xoá
export const deleteOrderItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const deleted = await orderItemService.deleteOrderItem(id);
    if (!deleted) return res.status(404).json({ message: 'Order item not found' });
    return res.status(200).json({ message: 'Xoá order item thành công' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};
