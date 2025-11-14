/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import axiosInstance from "../utils/instance/authInstance";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authApis = {
  //
  login: async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);
      return response.data;
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },
  //
  register: async (payload: {
    username: string;
    password: string;
    email: string;
  }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        payload
      );
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await axiosInstance.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });
    return res.data;
  },

  // lấy thông tin user hiện tại
  getMe: async (accessToken: string) => {
    const res = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },
  forgotPassword: async ({ email }: { email: string }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email,
      });
      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message };
    }
  },

  resetPassword: async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/reset-password/${token}`,
        {
          newPassword: password,
        }
      );
      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message };
    }
  },
};
