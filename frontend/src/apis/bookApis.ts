import axios from "axios";
import { instance } from "../utils/instance";

const BASE_URL = 'http://localhost:3000';



// Lấy tất cả sách  
export const BookApi = {
    // getAllBooks: async () => {
    //     const response = await axios.get(`${BASE_URL}/books`, {
    //         headers: {
    //             "Content-Type": "application/json",
    //             Accept: "application/json",
    //             Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //     });
    //     return response.data;
    // },
    getAllBooks: async () => {
        const response = await instance.get(`/books`);
        return response.data;
    },

    // Lấy sách theo ID
    getBookById: async (id: string) => {
        const response = await axios.get(`${BASE_URL}/books/${id}`);
        return response.data;
    },
    // Tạo sách mới
    createBook: async (book: { bookName: string; bookDescription: string; thumbnail: string; author: string; }) => {
        const response = await axios.post(`${BASE_URL}/books`, book);
        return response.data;
    },
    // Cập nhật sách
    updateBook: async (id: string, book: { bookName?: string; bookDescription?: string; thumbnail?: string; author?: string; }) => {
        const response = await axios.put(`${BASE_URL}/books/${id}`, book);
        return response.data;
    },
    // Xóa sách
    deleteBook: async (id: string) => {
        const response = await axios.delete(`${BASE_URL}/books/${id}`);
        return response.data;
    },
};