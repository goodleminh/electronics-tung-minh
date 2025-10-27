import {Router} from 'express';
import * as bookController from '../controllers/book.controller.js';

const bookRouter = Router();

// GET /books
bookRouter.get('/', bookController.getAllBooks);

//GET /books/:id
bookRouter.get('/:id', bookController.getBookById);

//POST /books
bookRouter.post('/', bookController.createBook);
//DELETE /books/:id
bookRouter.delete('/:id', bookController.deleteBook);
//PUT /books/:id
bookRouter.put('/:id', bookController.updateBook);

export default bookRouter; 