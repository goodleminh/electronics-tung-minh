import { configureStore } from "@reduxjs/toolkit";
import { productReducer } from "./features/product/productSlice";
import { categoryReducer } from "./features/category/categorySlice";
import authReducer from "../redux/features/auth/authSlice";
import { cartReducer } from "./features/cart/cartSlice";
import profileReducer from "../redux/features/profile/profileSlice";
export const store = configureStore({
  reducer: {
    //them product vao store
    product: productReducer,
    //them category vao store
    category: categoryReducer,
    auth: authReducer,
    cart: cartReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
