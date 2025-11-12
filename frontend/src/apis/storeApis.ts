import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const StoreApi = {
  getAllStores: async () => {
    const res = await axios.get(`${BASE_URL}/stores`);
    return res.data;
  },
  getStoreById: async (id: number | string) => {
    const res = await axios.get(`${BASE_URL}/stores/${id}`);
    return res.data;
  },
  createStore: async (data: { seller_id: number; name: string; description?: string }) => {
    const res = await axios.post(`${BASE_URL}/stores`, data);
    return res.data;
  },
  updateStore: async (
    id: number | string,
    data: { name?: string; description?: string }
  ) => {
    const res = await axios.put(`${BASE_URL}/stores/${id}`, data);
    return res.data;
  },
  deleteStore: async (id: number | string) => {
    const res = await axios.delete(`${BASE_URL}/stores/${id}`);
    return res.data;
  },
};

export { StoreApi };