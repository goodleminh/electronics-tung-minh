/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { type AppDispatch, type RootState } from "../../redux/store";
import { forgotPassword } from "../../redux/features/auth/authSlice";
import { LoadingOutlined } from "@ant-design/icons";

const ForgotPasswordForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      toast.success(result); // result là message từ thunk
    } catch (err: any) {
      toast.error(err);
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

        {!loading && (
          <button
            type="submit"
            className="w-full bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white font-semibold py-2 rounded-md cursor-pointer"
          >
            Gửi email đặt lại mật khẩu
          </button>
        )}
        {loading && (
          <button
            type="submit"
            className="w-full bg-[#8b2e0f] hover:bg-[#2b2b2b] flex justify-center items-center text-white font-semibold py-2 rounded-md cursor-pointer"
          >
            <LoadingOutlined className="mr-2" /> Đang gửi email
          </button>
        )}
      </form>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ForgotPasswordForm;
