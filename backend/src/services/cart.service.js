import { CartItem } from "../models/cart.model.js";

// lấy tất cả giỏ hàng
export const getAllCarts = async () => {
  const carts = await CartItem.findAll();
  return carts;
};

// thêm sản phẩm vào giỏ hàng
export const addToCart = async (buyer_id, product_id, quantity = 1) => {
  const newCartItem = await CartItem.create({ buyer_id, product_id, quantity });
  return newCartItem;
};
