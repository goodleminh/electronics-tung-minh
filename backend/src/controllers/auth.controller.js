import * as authService from "../services/auth.service.js";

export const login = async (req, res) => {
  const username = req.body?.username || "";
  const password = req.body?.password || "";

  const result = await authService.login(username, password);
  if (!result.accessToken) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json(result);
};

export const register = async (req, res) => {
  const user = req.body || {};

  const result = await authService.register(user);
  if (!result?.userId) {
    return res
      .status(400)
      .json({ message: result?.message || "Registration failed" });
  }
 
  return res.status(201).json(result);
};