import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BookApi } from "../../../apis/bookApis";


export interface IBook {
    bookId: string,
    bookName: string,
    bookDescription: string,
    thumbnail: string,
    author: string,
}
// Định nghĩa kiểu trạng thái cho tất cả sách
interface BookState {
    books: IBook[];
    loading: boolean;
}
const initialState: BookState = {
    books: [],
    loading: false,
};
// Định nghĩa kiểu trạng thái cho sách theo ID
interface BookByIdState {
  book: IBook | null;
  loading: boolean;
}
const initialBookByIdState: BookByIdState = {
  book: null,
  loading: false,
};

// Lấy tất cả sách
export const actFetchBooks = createAsyncThunk(
    "books/fetchBooks",
    async () => {
        const books = await BookApi.getAllBooks();
        return books;
    },
);
// Lấy sách theo ID
export const actFetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id: string) => {
    const book = await BookApi.getBookById(id);
    return book;
  }
);

// Tạo slice cho sách với các trạng thái loading, success, error
const bookSlice = createSlice({
    name: "books",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(actFetchBooks.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(actFetchBooks.fulfilled, (state, action) => {
            state.loading = false;
            state.books = action.payload;
        });
        builder.addCase(actFetchBooks.rejected, (state) => {
            state.loading = false;
            console.log("Failed to fetch books");
        });
    },  
});
//tao slice cho id sach voi cac trang thai loading, success, error
const bookByIdSlice = createSlice({
  name: "bookById", 
    initialState: initialBookByIdState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(actFetchBookById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(actFetchBookById.fulfilled, (state, action) => {
            state.loading = false;
            state.book = action.payload;
        });
        builder.addCase(actFetchBookById.rejected, (state) => {
            state.loading = false;
            console.log("Failed to fetch book by id");
        });
    },
});





export const bookReducer = bookSlice.reducer;
export const bookByIdReducer = bookByIdSlice.reducer;
