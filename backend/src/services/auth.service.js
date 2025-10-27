import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

dotenv.config();

export const login = async (username, password) => {
  let accessToken = null;
  const curUser = await User.findOne({
    where: { username: username },
  });
  const isValidPassword = curUser
    ? await bcrypt.compare(password, curUser.password)
    : false;

  if (!!curUser && isValidPassword) {
    accessToken = jwt.sign(
      { username: "admin", role: "admin" },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );
    console.log(accessToken, "accessToken");
  }

  return {
    accessToken: accessToken,
  };
};
 
export const register = async (user) => {
  const password = user.password || "";
  const salt = parseInt(process.env.BCRYPT_SALT);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = {
    ...user,
    password: hashedPassword,
  };

  try {
    const result = await User.create(newUser);
    return result;
  } catch (error) {
    return {
      message: "Can't create user, please check username",
    };
  }
};