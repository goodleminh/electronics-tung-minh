import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApis = {
  login: async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response.data.message;
      throw new Error(message);
    }
  },
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
};
