import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getAllProducts);

export default router;
