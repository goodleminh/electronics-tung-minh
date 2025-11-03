import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

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
  return { user };
};

export const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Sai email or password");
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Sai password");
  const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return { token, user };
};
