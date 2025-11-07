import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const ProductApi = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data;
  },
  getProductById: async (id: string | number) => {
    const res = await axios.get(`${BASE_URL}/products/${id}`);
    return res.data;
  },
  getRelatedProducts: async ({
    category_id,
    product_id,
  }: {
    category_id: number;
    product_id: number;
  }) => {
    const res = await axios.get(
      `${BASE_URL}/products/related/${category_id}/${product_id}`
    );
    return res.data;
  },
};

export { ProductApi };
