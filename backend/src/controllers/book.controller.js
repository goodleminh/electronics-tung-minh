import * as bookService from "../services/book.service.js";


// Lấy tất cả sách
export const getAllBooks = async (req, res) => {
    const books = await bookService.getAllBooks();
    res.status(200).send(books);
};

// Lấy sách theo ID
export const getBookById = async (req, res) => {
    const id = req.params.id;
    const book = await bookService.getBookById(id);
    if (book) {
        res.status(200).send(book);
    } else {
        res.status(404).send({message: 'Book not found'});
    }
};
// Tạo sách mới 
export const createBook = async (req, res) => {
    const bookData = req.body;
    const newBook = await bookService.createBook(bookData);
    if (newBook) {
        res.status(200).send(newBook);
    } else {
        res.status(400).send({ message: 'Failed to create book' });
    }
};

// Xóa sách theo ID
export const deleteBook = async (req, res) => {
    const id = req.params.id;
    const deleted = await bookService.deleteBook(id);
    if (deleted) {
        res.status(200).send({ message: 'Book deleted successfully' });
    } else {
        res.status(404).send({ message: 'Book not found' });
    }
};

// Sua thong tin sach theo ID
export const updateBook = async (req, res) => {
    const id = req.params.id;
    const bookData = req.body;
    const updatedBook = await bookService.updateBook(id, bookData);
    if (updatedBook) {
        res.status(200).send(updatedBook);
    } else {
        res.status(404).send({ message: 'Book not found' });
    }
};
