import * as categoryService from "../services/category.service.js";

// Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).send(categories);
};