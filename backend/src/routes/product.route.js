import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getAllProducts);
// Tìm kiếm sản phẩm với phân trang
router.get("/search", productController.searchProducts);

// Sản phẩm liên quan
router.get(
  "/related/:category_id/:product_id",
  productController.getRelatedProducts
);
// Lấy sản phẩm theo id
router.get("/:id", productController.getProductById);
// Tạo sản phẩm mới
router.post("/", productController.createProduct);
// Sửa thông tin sản phẩm
router.put("/:id", productController.updateProduct);
// Xoá sản phẩm
router.delete("/:id", productController.deleteProduct);

export default router;
