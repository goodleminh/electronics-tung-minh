import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();
// Lấy tất cả danh mục
router.get("/", categoryController.getAllCategories);

export default router;
