import axios from "axios";

const BASE_URL = "http://localhost:3000/api/auth";

export const authApis = {
  login: async (payload: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, payload);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.response.data.message;
      throw new Error(message);
    }
  },
  register: async (payload: {
    username: string;
    password: string;
    email: string;
  }) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, payload);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.response.data.message;
      throw new Error(message);
    }
  },
};
