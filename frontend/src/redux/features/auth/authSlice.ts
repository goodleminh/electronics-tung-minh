import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthApis } from "../../../apis/authApis";

interface AuthState {
    isAuthenticated: boolean;
    userInfo: object | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    userInfo: null,
};

export const actLogin = createAsyncThunk(
    "auth/login",
    async (payload: { username: string; password: string; cb: () => void }) => {
        // Gọi API đăng nhập ở đây và trả về dữ liệu người dùng
        const data = await AuthApis.login(payload);
        localStorage.setItem("token", data.accessToken);
        console.log("Login data:", data);
        return {
            cb: payload.cb,
        };
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.userInfo = null;
            localStorage.removeItem("accessToken");
        },
    },
    extraReducers: (builder) => {
        builder.addCase(actLogin.fulfilled, (state, action) => {
            state.isAuthenticated = true;

            action.payload.cb();
        });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
