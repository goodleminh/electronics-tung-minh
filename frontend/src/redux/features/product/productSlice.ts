import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ProductApi } from "../../../apis/productApis";

// Interface mô tả 1 sản phẩm
export interface IProduct {
  product_id: number;
  store_id: number;
  category_id?: number | null;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

// Interface cho state
interface ProductState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// 🔹 Async thunk: lấy danh sách tất cả sản phẩm
export const actFetchProducts = createAsyncThunk<IProduct[]>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await ProductApi.getAllProducts();
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể tải danh sách sản phẩm");
    }
  }
);

// 🔹 Tạo Slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Có thể thêm reducers đồng bộ sau (ví dụ: thêm sản phẩm local)
  },
  extraReducers: (builder) => {
    builder
      .addCase(actFetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actFetchProducts.fulfilled, (state, action: PayloadAction<IProduct[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(actFetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const productReducer = productSlice.reducer;
