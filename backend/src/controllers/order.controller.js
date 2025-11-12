import * as orderService from '../services/order.service.js';

// Lấy tất cả đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Lấy đơn hàng theo buyer_id
export const getOrdersByBuyerId = async (req, res) => {
  try {
    const buyerId = Number(req.params.buyerId);
    if (Number.isNaN(buyerId)) {
      return res.status(400).json({ message: 'Invalid buyer id' });
    }
    const orders = await orderService.getOrdersByBuyerId(buyerId);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Lấy đơn hàng theo ID
export const getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const { buyer_id, total_amount, address, payment_method, status } = req.body;
    if (!buyer_id || !total_amount || !address) {
      return res.status(400).json({ message: 'buyer_id, total_amount, address là bắt buộc' });
    }
    const newOrder = await orderService.createOrder({ buyer_id, total_amount, address, payment_method, status });
    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const updatedOrder = await orderService.updateOrder(id, req.body);
    return res.status(200).json(updatedOrder);
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Xoá đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    await orderService.deleteOrder(id);
    return res.status(204).send();
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

