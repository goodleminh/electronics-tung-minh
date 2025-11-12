import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get(
  "/related/:category_id/:product_id",
  productController.getRelatedProducts
);
export default router;
