import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import dotenv from "dotenv";
import { Op } from "sequelize";

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
