import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import dotenv from "dotenv";
import { Op } from "sequelize";
import crypto from "crypto";
import { sendMail } from "../config/mailer.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const register = async (username, email, password, role) => {
  // Kiểm tra username hoặc email trùng
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email đã tồn tại");
    if (existingUser.username === username)
      throw new Error("Username đã tồn tại");
  }

  const salt = parseInt(process.env.BCRYPT_SALT);
  const hashed = await bcrypt.hash(password, salt);

  const newUser = {
    username,
    email,
    password: hashed,
    role,
  };
  const user = await User.create(newUser);
  return user;
};

export const login = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    attributes: ["user_id", "username", "email", "role", "password"],
  });
  if (!user) throw new Error("Sai email or password");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Sai password");

  // accessToken
  const accessToken = jwt.sign(
    { id: user.user_id, role: user.role, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // refreshToken
  const refreshToken = jwt.sign(
    { user_id: user.user_id, username: user.username },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return { accessToken, refreshToken, user };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email: email } });
  if (!user) throw new Error("Email không hợp lệ!");

  // Tạo token xác nhận
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); //15 phút

  user.resetToken = resetToken;
  user.resetTokenExpires = expires;

  await user.save();

  const resetLink = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}`;
  await sendMail(
    //to email
    user.email,
    // subject
    `Xác nhận yêu cầu đặt lại mật khẩu`,
    // html
    `<h3>Xin chào ${user.username}</h3>
    <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu.</p>
    <p>Nếu đúng là bạn, hãy nhấn vào liên kết bên dưới để xác nhận và đặt lại mật khẩu:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Liên kết này có hiệu lực trong 15 phút.</p>
    <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>`
  );
  return true;
};

export const resetPassword = async (token, newPassword) => {
  if (!newPassword) throw new Error("Password mới không được để trống");
  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: new Date() },
    },
  });
  // const salt = parseInt(process.env.BCRYPT_SALT);
  if (!user) throw new Error("Token không hợp lệ hoặc đã hết hạn!");
  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();

  return true;
};
