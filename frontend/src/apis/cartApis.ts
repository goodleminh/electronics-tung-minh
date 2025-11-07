import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const CartApi = {
  // Lấy tất cả giỏ hàng
  getAllCartItems: async () => {
    const response = await axios.get(`${BASE_URL}/carts`);
    return response.data;
  },
  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (item: { buyer_id: number; product_id: number; quantity?: number }) => {
    const response = await axios.post(`${BASE_URL}/carts`, item);
    return response.data;
  },
};

export { CartApi };