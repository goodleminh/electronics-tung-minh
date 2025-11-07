import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Kiểm tra token có hợp lệ ko
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Not login" });

  const accessToken = authHeader.split(" ")[1];

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(401).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};
