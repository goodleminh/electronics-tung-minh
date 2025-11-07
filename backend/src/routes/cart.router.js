import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";

const router = Router();
// Lấy tất cả giỏ hàng
router.get("/", cartController.getAllCarts);
// Thêm sản phẩm vào giỏ hàng
router.post("/", cartController.addToCart);

export default router;