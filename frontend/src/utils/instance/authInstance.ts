import axios from "axios";

const BASE_URL = "http://localhost:5000";
const axiosInstance = axios.create({ baseURL: BASE_URL });

// Thêm access token vào mỗi request
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Tự động refresh token khi access token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest); // Gửi lại request cũ
      } catch {
        console.error("Refresh token hết hạn");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
