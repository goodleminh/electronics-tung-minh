import { Op } from "sequelize";
import { Product } from "../models/product.model.js";

// lấy tất cả sản phẩm
export const getAllProducts = async () => {
  const products = await Product.findAll();
  return products;
};

export const getProductById = async (id) => {
  const product = await Product.findByPk(id);
  return product;
};

export const getRelatedProducts = async (category_id, product_id) => {
  const products = await Product.findAll({
    where: {
      category_id: category_id,
      product_id: { [Op.ne]: product_id }, // loại bỏ sản phẩm hiện tại
    },
    limit: 4,
  });
  return products;
};
