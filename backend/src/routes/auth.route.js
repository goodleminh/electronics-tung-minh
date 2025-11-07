import * as authController from "../controllers/auth.controller.js";
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

authRouter.post("/refresh", authController.refresh);
authRouter.get("/me", verifyToken, authController.getMe);

export default authRouter;
