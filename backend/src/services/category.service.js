import { Category } from "../models/category.model.js";

// lấy tất cả danh mục
export const getAllCategories = async () => {
  const categories = await Category.findAll();
  return categories;
};
