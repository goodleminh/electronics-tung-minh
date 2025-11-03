import { Product } from "../models/product.model.js";

// lấy tất cả sản phẩm 
export const getAllProducts = async () => {
  const products = await Product.findAll();
  return products;
};