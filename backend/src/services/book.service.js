import { Book } from "../models/book.model.js";


// Lấy sách theo ID
export const getBookById = async (id) => {
  const book = await Book.findByPk(id);
  return book;
};
// Lấy tất cả sách
export const getAllBooks = async () => {
  const books = await Book.findAll();
  return books;
};
// Thêm sách mới
export const createBook = async (bookData) => {
  const newBook = await Book.create(bookData);
  return newBook;
};
 
// Xóa sách theo ID
export const deleteBook = async (id) => {
  const book = await Book.findByPk(id);
  if (book) {
    await book.destroy();
    return true;
  } 
  return false;
};

// Cập nhật thông tin sách theo ID
export const updateBook = async (id, bookData) => {
  const book = await Book.findByPk(id); 
  if (book){
    await book.update(bookData);
    return book;
  } 
  return null;
};
