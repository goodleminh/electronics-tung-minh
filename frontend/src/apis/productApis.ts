import axios from "axios";

const BASE_URL = 'http://localhost:3000';


const ProductApi = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        const response = await axios.get(`${BASE_URL}/products`);
        return response.data;
    }
};

export { ProductApi };
