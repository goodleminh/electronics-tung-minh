import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CategoryApi } from "../../../apis/categoryApis";

// Interface danh mục (khớp backend)
export interface ICategory {
  category_id: number;
  name: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoryState {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunk: Lấy tất cả danh mục
export const actFetchCategories = createAsyncThunk<ICategory[], void, { rejectValue: string }>(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await CategoryApi.getAllCategories();
      return categories as ICategory[];
    } catch (err: any) {
      return rejectWithValue(err?.message || "Không thể tải danh mục");
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actFetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actFetchCategories.fulfilled,
        (state, action: PayloadAction<ICategory[]>) => {
          state.loading = false;
          state.categories = action.payload;
        }
      )
      .addCase(actFetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      });
  },
});

export const categoryReducer = categorySlice.reducer;
