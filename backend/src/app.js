import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import bookRouter from './routes/book.router.js';
import cors from 'cors';
import authRouter from './routes/auth.router.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors());

// noi dung phan body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.use('/books', authMiddleware, bookRouter);
app.use('/auth', authRouter);

export default app; 

