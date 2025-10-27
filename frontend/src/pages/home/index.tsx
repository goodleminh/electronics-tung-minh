import { Button, Table, type TableProps } from 'antd';
import { actFetchBooks, type IBook } from '../../redux/features/book/bookSlice';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { AppDispatch, RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';



function HomePage() {
    const dispatch = useDispatch<AppDispatch>();
    const { books, loading } = useSelector((state: RootState) => state.book);

    const columns: TableProps<IBook>["columns"] = [
        { title: 'ID', dataIndex: 'bookId', key: 'bookId' },
        { title: 'Book Name', dataIndex: 'bookName', key: 'bookName' },
        { title: 'Description', dataIndex: 'bookDescription', key: 'bookDescription' },
        { title: 'Thumbnail', dataIndex: 'thumbnail', key: 'thumbnail' },
        { title: 'Author', dataIndex: 'author', key: 'author' },
        { title: 'Action', key: 'action', render: (record) => (
            <>
            <Link to={`/books/${record.bookId}`}>
            <Button>Xem chi tiết</Button>
            </Link>
            </>
        ) },
    ];
    useEffect(() => {
        dispatch(actFetchBooks());
    }, []);

    return (
        <div>
            <h1>Home Page</h1>
            <Table 
            dataSource={books} 
            columns={columns} 
            rowKey="bookId" 
            loading={loading} 
            />
            <Link to="/books/add">
                <Button type="primary" style={{ marginTop: 16 }}>
                    Add New Book
                </Button>
            </Link>
        </div>
    );
}
export default HomePage;