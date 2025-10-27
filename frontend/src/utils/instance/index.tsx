import axios from "axios";

export const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  config.headers["Content-Type"] = "application/json";
  config.headers["Accept"] = "application/json";

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
