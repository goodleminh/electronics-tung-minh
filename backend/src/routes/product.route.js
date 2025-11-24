import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Multer setup for product image upload
const productDir = path.join(process.cwd(), "src/public/product");
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/public/product"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Lấy tất cả sản phẩm
router.get("/", productController.getAllProducts);
// Lấy sản phẩm theo cửa hàng
router.get("/store/:storeId", productController.getProductsByStoreId);
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
router.post("/", upload.single("image"), productController.createProduct);
// Sửa thông tin sản phẩm
router.put("/:id", upload.single("image"), productController.updateProduct);
// Xoá sản phẩm
router.delete("/:id", productController.deleteProduct);

export default router;
