/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ProductApi } from "../../../apis/productApis";

// Interface mô tả 1 sản phẩm
export interface IProduct {
  product_id: number;
  store_id?: number;
  category_id?: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number | null; // giá sau giảm (nullable)
  discount_expiry?: string | null; // hạn áp dụng giảm giá (nullable ISO string)
  stock: number;
  image?: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

// Interface cho state
interface ProductState {
  products: IProduct[];
  productDetail: IProduct | null;
  productRelated: IProduct[];
  loading: boolean;
  error: string | null;
  // New: search pagination state
  searchItems: IProduct[];
  searchLoading: boolean;
  searchLoadingMore: boolean;
  searchError: string | null;
  searchPage: number;
  searchPageSize: number;
  searchTotal: number;
  searchHasMore: boolean;
  searchParams: {
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
    limit?: number;
  };
}

const initialState: ProductState = {
  products: [],
  productDetail: null,
  productRelated: [],
  loading: false,
  error: null,
  searchItems: [],
  searchLoading: false,
  searchLoadingMore: false,
  searchError: null,
  searchPage: 1,
  searchPageSize: 12,
  searchTotal: 0,
  searchHasMore: false,
  searchParams: {},
};

// 🔹 Async thunk: lấy danh sách tất cả sản phẩm
export const actFetchProducts = createAsyncThunk<IProduct[]>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await ProductApi.getAllProducts();
      return products;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Không thể tải danh sách sản phẩm"
      );
    }
  }
);

// Lấy sản phẩm theo cửa hàng
export const fetchProductsByStoreId = createAsyncThunk(
  "products/fetchByStoreId",
  async (storeId: string | number, { rejectWithValue }) => {
    try {
      const products = await ProductApi.getProductsByStoreId(storeId);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

//  Lấy chi tiết sản phẩm theo id
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const product = await ProductApi.getProductById(id);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Thêm sản phẩm mới
export const createProduct = createAsyncThunk(
  "products/create",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const product = await ProductApi.createProduct(data);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Cập nhật sản phẩm
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, data }: { id: string | number; data: FormData },
    { rejectWithValue }
  ) => {
    try {
      const product = await ProductApi.updateProduct(id, data);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Xóa sản phẩm
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const product = await ProductApi.deleteProduct(id);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Lấy sản phẩm liên quan
export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelated",
  async (
    params: { category_id: number; product_id: number },
    { rejectWithValue }
  ) => {
    try {
      const { category_id, product_id } = params;
      const res = await ProductApi.getRelatedProducts({
        category_id,
        product_id,
      });
      return res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Tìm kiếm sản phẩm với phân trang
export const searchProducts = createAsyncThunk(
  "products/search",
  async (
    params: {
      q?: string;
      category?: string;
      min?: string;
      max?: string;
      sort?: string;
      page?: number;
      limit?: number;
      reset?: boolean; // if true, start over
    },
    { rejectWithValue }
  ) => {
    try {
      const { reset, ...query } = params;
      const res = await ProductApi.searchProducts(query);
      return { ...res, reset };
    } catch (error: any) {
      return rejectWithValue(error.message || "Search failed");
    }
  }
);

// 🔹 Tạo Slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Reset search state manually if needed
    resetSearchState(state) {
      state.searchItems = [];
      state.searchLoading = false;
      state.searchLoadingMore = false;
      state.searchError = null;
      state.searchPage = 1;
      state.searchTotal = 0;
      state.searchHasMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actFetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // lấy tất cả sản phẩm
      .addCase(
        actFetchProducts.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.loading = false;
          state.products = action.payload;
        }
      )
      // lấy tất cả sản phẩm thất bại
      .addCase(actFetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Lấy sản phẩm theo cửa hàng
      .addCase(
        fetchProductsByStoreId.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.loading = false;
          state.products = action.payload;
        }
      )
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<IProduct | null>) => {
          state.loading = false;
          state.productDetail = action.payload;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        // Fix: should be false
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sản phẩm liên quan
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.productRelated = action.payload as IProduct[];
      })
      // Search products
      .addCase(searchProducts.pending, (state, action) => {
        const page = (action.meta.arg && action.meta.arg.page) || 1;
        if (page > 1) state.searchLoadingMore = true; else state.searchLoading = true;
        if (page === 1) state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        const { items, total, page, pageSize, hasMore, reset } = action.payload as any;
        if (reset || page === 1) {
          state.searchItems = items;
        } else {
          state.searchItems = [...state.searchItems, ...items];
        }
        state.searchTotal = total;
        state.searchPage = page;
        state.searchPageSize = pageSize;
        state.searchHasMore = hasMore;
        state.searchLoading = false;
        state.searchLoadingMore = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchError = action.payload as string;
        state.searchLoading = false;
        state.searchLoadingMore = false;
      });
  },
});

export const { resetSearchState } = productSlice.actions;
export const productReducer = productSlice.reducer;
