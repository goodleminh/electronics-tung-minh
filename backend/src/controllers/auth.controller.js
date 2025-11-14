import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await authService.register(username, email, password, role);
    res.status(200).json({ message: "Đăng kí thành công!", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(
      email,
      password
    );
    res.status(200).json({
      message: "Đăng nhập thành công! ",
      accessToken,
      refreshToken,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

//Get current user
export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// Refresh token
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Thiếu refresh token" });

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Refresh token không hợp lệ" });

      // Tạo accessToken mới
      const newAccessToken = jwt.sign(
        { id: decoded.user_id, username: decoded.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ accessToken: newAccessToken });
    });
  } catch {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({ message: "Đã gửi email reset password" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    if (!token || !newPassword)
      throw new Error("Token hoặc mật khẩu không hợp lệ");
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
