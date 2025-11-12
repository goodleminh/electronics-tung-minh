import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CartApi } from "../../../apis/cartApis";

// Interface mô tả 1 item trong giỏ hàng
export interface ICartItem {
  cart_item_id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Payload khi thêm vào giỏ
export interface AddCartPayload {
  buyer_id: number;
  product_id: number;
  quantity?: number;
}

// Interface cho state
interface CartState {
  items: ICartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Lấy tất cả item trong giỏ
export const actFetchCartItems = createAsyncThunk<ICartItem[], void, { rejectValue: string }>(
  "cart/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const items = await CartApi.getAllCartItems();
      return items as ICartItem[];
    } catch (err: any) {
      return rejectWithValue(err?.message || "Không thể tải giỏ hàng");
    }
  }
);

// Thêm vào giỏ hàng
export const actAddToCart = createAsyncThunk<ICartItem, AddCartPayload, { rejectValue: string }>(
  "cart/add",
  async (payload, { rejectWithValue }) => {
    try {
      const item = await CartApi.addToCart(payload);
      return item as ICartItem;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Không thể thêm vào giỏ hàng"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actFetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actFetchCartItems.fulfilled,
        (state, action: PayloadAction<ICartItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(actFetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      })
      .addCase(actAddToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actAddToCart.fulfilled,
        (state, action: PayloadAction<ICartItem>) => {
          state.loading = false;
          const idx = state.items.findIndex(
            (i) => i.buyer_id === action.payload.buyer_id && i.product_id === action.payload.product_id
          );
          if (idx >= 0) {
            state.items[idx].quantity += action.payload.quantity;
          } else {
            state.items.push(action.payload);
          }
        }
      )
      .addCase(actAddToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Đã có lỗi xảy ra";
      });
  },
});

export const { clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
