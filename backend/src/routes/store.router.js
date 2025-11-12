import { Router } from "express";
import * as storeController from "../controllers/store.controller.js";

const router = Router();
// Lấy tất cả cửa hàng
router.get("/", storeController.getStores);
// Lấy cửa hàng theo ID
router.get("/:id", storeController.getStore);
// Tạo cửa hàng mới
router.post("/", storeController.createStoreController);
// Cập nhật cửa hàng
router.put("/:id", storeController.updateStoreController);
// Xoá cửa hàng
router.delete("/:id", storeController.deleteStoreController);

export default router;