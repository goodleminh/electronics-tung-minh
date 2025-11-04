import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const CategoryApi = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data;
  },
};

export { CategoryApi };
