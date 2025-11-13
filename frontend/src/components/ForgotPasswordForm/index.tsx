/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Kiểm tra email để đặt lại mật khẩu!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi server");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-8 py-10 w-full max-w-sm space-y-5"
      >
        <h2 className="text-xl font-semibold text-center mb-6">
          Quên mật khẩu
        </h2>

        <input
          type="email"
          placeholder="Nhập email của bạn để xác minh"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b2e0f] focus:border-transparent"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white font-semibold py-2 rounded-md cursor-pointer"
        >
          Gửi email đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
