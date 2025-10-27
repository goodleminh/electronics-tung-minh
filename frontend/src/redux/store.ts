import { configureStore} from '@reduxjs/toolkit'
import { bookByIdReducer, bookReducer } from './features/book/bookSlice'
import authReducer from './features/auth/authSlice';

export const store = configureStore({
    reducer: {
        //them book vao store
        book: bookReducer,
        //them bookById vao store
        bookById: bookByIdReducer,
        //them auth vao store
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;