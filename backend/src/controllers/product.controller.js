import * as productService from "../services/product.service.js";

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
    const products = await productService.getAllProducts();
    res.status(200).send(products);
};