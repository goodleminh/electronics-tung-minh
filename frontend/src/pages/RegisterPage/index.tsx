import React, { useState } from "react";
import axios from "axios";
import "./style.css";
interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agree: boolean;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agree: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.agree) {
      alert("You must agree to the terms!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        formData
      );
      alert("Register success!");
      console.log(res.data);
    } catch (err) {
      alert("Register failed!");
      console.error(err);
    }
  };

  return (
    <div className="register-page max-w-[600px] mx-auto text-center mt-5">
      <h2 className="text-[30px] inline-block mb-5 border-b-2 border-[brown]">
        Create Account
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-lg mx-auto p-6  rounded-2xl text-left "
      >
        <div>
          <label className="block mb-1">First Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#8b2e0f]"
            type="password"
            name="password"
            placeholder="Password"
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
        <button className=" max-w-[100px] bg-gray-800 text-white py-2 rounded hover:bg-red-800 cursor-pointer">
          CREATE
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
