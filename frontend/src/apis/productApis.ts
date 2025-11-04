import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const ProductApi = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data;
  },
};

export { ProductApi };
