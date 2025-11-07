import * as cartService from "../services/cart.service.js";

// Lấy tất cả giỏ hàng
export const getAllCarts = async (req, res) => {
  const carts = await cartService.getAllCarts();
  res.status(200).send(carts);
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  const { buyer_id, product_id, quantity } = req.body;
  if (!buyer_id || !product_id) {
    return res.status(400).send({ message: "buyer_id và product_id là bắt buộc" });
  }
  const newCartItem = await cartService.addToCart(buyer_id, product_id, quantity);
  res.status(201).send(newCartItem);
};