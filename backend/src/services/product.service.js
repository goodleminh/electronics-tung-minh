import { Op } from "sequelize";
import { Product } from "../models/product.model.js";

// lấy tất cả sản phẩm
export const getAllProducts = async () => {
  const products = await Product.findAll();
  return products;
};
// lấy sản phẩm theo ID
export const getProductById = async (id) => {
  const product = await Product.findByPk(id);
  return product;
};
// tạo sản phẩm mới
export const createProduct = async (productData) => {
  const newProduct = await Product.create(productData);
  return newProduct;
};
// sửa thông tin sản phẩm
export const updateProduct = async (id, productData) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.update(productData);
  return product;
};
// xoá sản phẩm
export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return product;
};
// lấy sản phẩm liên quan theo danh mục
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
// tìm kiếm sản phẩm với bộ lọc và phân trang (bao gồm: từ khóa, danh mục, khoảng giá, sắp xếp, trang, giới hạn)
export const searchProducts = async ({
  q,
  category,
  min,
  max,
  sort,
  page = 1,
  limit = 12,
}) => {
  const where = {};

  // Keyword search on name/description
  if (q && String(q).trim().length > 0) {
    const kw = `%${String(q).trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: kw } },
      { description: { [Op.like]: kw } },
    ];
  }

  // Category filter (numeric id)
  if (category && !isNaN(Number(category))) {
    where.category_id = Number(category);
  }

  // Price range
  if (min || max) {
    const priceCond = {};
    if (!isNaN(Number(min))) priceCond[Op.gte] = Number(min);
    if (!isNaN(Number(max))) priceCond[Op.lte] = Number(max);
    if (Object.keys(priceCond).length) where.price = priceCond;
  }

  // Sorting
  let order = [];
  switch (sort) {
    case "price-asc":
      order = [["price", "ASC"]];
      break;
    case "price-desc":
      order = [["price", "DESC"]];
      break;
    case "newest":
      order = [["created_at", "DESC"]];
      break;
    case "bestseller":
      // No sold column available; fallback to newest
      order = [["created_at", "DESC"]];
      break;
    default:
      // relevance/default
      order = [["created_at", "DESC"]];
      break;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(limit) || 12));
  const offset = (pageNum - 1) * pageSize;

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit: pageSize,
    offset,
  });

  const totalPages = Math.ceil(count / pageSize) || 1;
  const hasMore = offset + rows.length < count;

  return {
    items: rows,
    total: count,
    page: pageNum,
    pageSize,
    totalPages,
    hasMore,
  };
};
