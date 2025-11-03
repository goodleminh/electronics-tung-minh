import axios from "axios";

const BASE_URL = 'http://localhost:3000';


const CategoryApi = {
    // Lấy tất cả danh mục
    getAllCategories: async () => {
        const response = await axios.get(`${BASE_URL}/categories`);
        return response.data;
    }
};

export { CategoryApi };
