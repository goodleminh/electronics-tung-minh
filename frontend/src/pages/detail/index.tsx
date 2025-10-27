import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { actFetchBookById } from "../../redux/features/book/bookSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import {Button} from "antd";

function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { book, loading } = useSelector((state: RootState) => state.bookById);

  useEffect(() => {
    if (id) {
      dispatch(actFetchBookById(id)); // Gọi action để fetch chi tiết sách
    }
  }, [id, dispatch]);

  if (loading) {
    return <p>Loading...</p>; // Hiển thị trạng thái loading
  }

  if (!book) {
    return <p>Book not found.</p>; // Hiển thị thông báo nếu không tìm thấy sách
  }

  return (
    <div>
      <Link to="/"><Button>Back to Home</Button></Link>
      <h1>Book Details</h1>
      <p><strong>ID:</strong> {book.bookId}</p>
      <p><strong>Name:</strong> {book.bookName}</p>
      <p><strong>Description:</strong> {book.bookDescription}</p>
      <p><strong>Thumbnail:</strong> {book.thumbnail}</p>
      <p><strong>Author:</strong> {book.author}</p>
    </div>
  );
}

export default BookDetailPage;