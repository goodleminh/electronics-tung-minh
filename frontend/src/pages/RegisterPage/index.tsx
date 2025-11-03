import React, { useState } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { registerUser } from "../../redux/features/auth/authSlice.ts";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store.ts";
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    if (!formData.agree) {
      toast.error("Bạn phải đồng ý với các điều khoản!");
      return;
    }
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message);
      setTimeout(() => {
        navigate("/login"); // chuyển sang trang login
      }, 2000);
    } else {
      toast.error(resultAction.payload);
    }
  };

  return (
    <>
      <div className="register-page max-w-[600px] mx-auto text-center mt-5">
        <h2 className="text-[30px] inline-block mb-4 border-b-2 border-[brown]">
          Create Account
        </h2>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4 max-w-lg mx-auto p-6  rounded-2xl text-left "
        >
          <div>
            <label className="block mb-1">Username</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              className="cursor-pointer"
              type="checkbox"
              name="agree"
              onChange={handleChange}
            />
            <label>I have read and agree with the Terms and condition</label>
          </div>
          <button className="mx-auto p-5 bg-gray-800 text-white py-2 rounded hover:bg-red-800 cursor-pointer">
            CREATE
          </button>
        </form>
        <div>
          <p>
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-[#8b2e0f] hover:underline font-medium">
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default RegisterPage;
