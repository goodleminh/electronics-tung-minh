/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { StoreApi } from "../../../apis/storeApis";

export interface IStore {
  store_id: number;
  seller_id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  status?: 'pending' | 'processing' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

interface StoreState {
  stores: IStore[];
  current?: IStore | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  stores: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchStores = createAsyncThunk<IStore[], void, { rejectValue: string }>(
  "stores/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const stores = await StoreApi.getAllStores();
      if (!Array.isArray(stores)) throw new Error("Dữ liệu cửa hàng trả về sai định dạng");
      return stores;
    } catch (err: any) {
      return rejectWithValue(err.message || "Không thể tải cửa hàng");
    }
  }
);

export const fetchStoreById = createAsyncThunk<IStore, number | string, { rejectValue: string }>(
  "stores/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const store = await StoreApi.getStoreById(id);
      if (!store?.store_id) throw new Error("Store không hợp lệ");
      return store;
    } catch (err: any) {
      return rejectWithValue(err.message || "Không thể tải cửa hàng");
    }
  }
);
// lấy store theo seller_id
export const fetchStoreBySellerId = createAsyncThunk<IStore, number | string, { rejectValue: string }>(
  "stores/fetchBySellerId",
  async (seller_id, { rejectWithValue }) => {
    try {
      const store = await StoreApi.getStoreBySellerId(seller_id);
      if (!store?.store_id) throw new Error("Store không hợp lệ");
      return store;
    } catch (err: any) {
      return rejectWithValue(err.message || "Không thể tải cửa hàng");
    }
  }
);
// tạo mới store
export const createStore = createAsyncThunk<
  IStore,
  { seller_id: number; name: string; description?: string; image?: string; status?: string },
  { rejectValue: string }
>("stores/create", async (payload, { rejectWithValue }) => {
  try {
    const store = await StoreApi.createStore(payload);
    if (!store?.store_id) throw new Error("Tạo store thất bại");
    return store;
  } catch (err: any) {
    return rejectWithValue(err.message || "Không thể tạo cửa hàng");
  }
});
// cập nhật store
export const updateStore = createAsyncThunk<
  IStore,
  { id: number | string; data: { name?: string; description?: string; status?: string; image?: string } },
  { rejectValue: string }
>("stores/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const store = await StoreApi.updateStore(id, data);
    if (!store?.store_id) throw new Error("Cập nhật store thất bại");
    return store;
  } catch (err: any) {
    return rejectWithValue(err.message || "Không thể cập nhật cửa hàng");
  }
});

export const deleteStore = createAsyncThunk<{ id: number | string }, number | string, { rejectValue: string }>(
  "stores/delete",
  async (id, { rejectWithValue }) => {
    try {
      await StoreApi.deleteStore(id);
      return { id };
    } catch (err: any) {
      return rejectWithValue(err?.message || "Không thể xoá cửa hàng");
    }
  }
);

const storeSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action: PayloadAction<IStore[]>) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi";
      })

      .addCase(fetchStoreById.fulfilled, (state, action: PayloadAction<IStore>) => {
        state.current = action.payload;
      })

      .addCase(fetchStoreBySellerId.fulfilled, (state, action: PayloadAction<IStore>) => {
        state.current = action.payload;
      })

      .addCase(createStore.fulfilled, (state, action: PayloadAction<IStore>) => {
        state.stores.unshift(action.payload);
      })

      .addCase(updateStore.fulfilled, (state, action: PayloadAction<IStore>) => {
        state.stores = state.stores.map((s) =>
          s.store_id === action.payload.store_id ? action.payload : s
        );
        if (state.current && state.current.store_id === action.payload.store_id) {
          state.current = action.payload;
        }
      })

      .addCase(deleteStore.fulfilled, (state, action: PayloadAction<{ id: number | string }>) => {
        state.stores = state.stores.filter((s) => s.store_id !== Number(action.payload.id));
        if (state.current && state.current.store_id === Number(action.payload.id)) {
          state.current = null;
        }
      });
  },
});

export const { clearCurrent } = storeSlice.actions;
export const storeReducer = storeSlice.reducer;
