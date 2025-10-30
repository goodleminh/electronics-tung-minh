import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center  mt-5">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Tiêu đề */}
        <h2 className="text-[30px] inline-block mb-5 border-b-2 border-[brown]">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5 text-left">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 ">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
              required
            />
          </div>

          {/* Nút + Forgot password */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="  bg-gray-800 text-white px-5 py-2 rounded hover:bg-green-800 transition cursor-pointer"
            >
              SIGN IN
            </button>
            <Link
              to="/forgot"
              className="text-[#8b2e0f] hover:underline text-sm font-medium"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        {/* Nút tạo tài khoản */}
        <div className="pt-6">
          <Link
            to="/register"
            className="bg-red-800 text-white px-10 py-3  hover:bg-gray-800 transition cursor-pointer"
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
