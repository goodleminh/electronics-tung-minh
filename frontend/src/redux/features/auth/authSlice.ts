/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApis } from "../../../apis/authApis";

//  Định nghĩa kiểu dữ liệu
export interface User {
  user_id: number;
  username: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// State khởi tạo
const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
  loading: false,
  error: null,
  isLoggedIn: false,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
};

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  message: string;
}

interface RegisterResponse {
  user: User;
  message: string;
}

//  Async Thunks

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApis.login(payload);
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    localStorage.setItem("user", JSON.stringify(res.user));
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApis.refreshToken();
      return res;
    } catch {
      localStorage.clear();
      return rejectWithValue("Refresh token hết hạn, đăng nhập lại");
    }
  }
);

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApis.register(payload);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return rejectWithValue("No token");

    try {
      const res = await authApis.getMe(accessToken);
      return res.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Token invalid");
    }
  }
);
//
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Server lỗi";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Server lỗi";
      })

      // Fetch User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
