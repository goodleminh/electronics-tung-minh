import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const newUser = await authService.register(username, email, password, role);
    res.status(200).json({ message: "Đăng kí thành công!", newUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ message: "Đăng nhập thành công! ", token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
