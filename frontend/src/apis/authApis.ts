import axios from "axios"

const BASE_URL = 'http://localhost:3000';

export const AuthApis = {
    login: async (payload: { username: string; password: string }) => {
        const response = await axios.post(`${BASE_URL}/auth/login`, payload);
        return response.data;
    },
    register: async (payload: { username: string; password: string }) => {
        const response = await axios.post(`${BASE_URL}/auth/register`, payload);
        return response.data;
    }
}