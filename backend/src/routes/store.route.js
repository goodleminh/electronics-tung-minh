import { Router } from "express";
import * as storeController from "../controllers/store.controller.js";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.middleware.js";
import fs from "fs";
import path from "path";

const router = Router();

// Multer setup for store image upload
const storeDir = path.join(process.cwd(), "src/public/store");
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/store"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Lấy tất cả cửa hàng
router.get("/", storeController.getStores);
// Lấy cửa hàng theo seller_id
router.get("/seller/:seller_id", storeController.getStoreBySellerId);
// Lấy cửa hàng theo ID
router.get("/:id", storeController.getStore);
// Tạo cửa hàng mới
router.post("/", storeController.createStoreController);
// Cập nhật cửa hàng
router.put("/:id", storeController.updateStoreController);
// Xoá cửa hàng
router.delete("/:id", storeController.deleteStoreController);
// Upload ảnh store
router.post(
  "/image",
  upload.single("image"),
  verifyToken,
  storeController.uploadStoreImage
);

export default router;