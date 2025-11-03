import { configureStore} from '@reduxjs/toolkit'
import { productReducer } from './features/product/productSlice';
import { categoryReducer } from './features/category/categorySlice';

export const store = configureStore({
    reducer: {
        //them product vao store
        product: productReducer,
        //them category vao store
        category: categoryReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;