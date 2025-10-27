DROP DATABASE IF EXISTS book_mng_app;
CREATE DATABASE book_mng_app;
USE book_mng_app;

-- Tạo bảng categories
CREATE TABLE categories
(
	category_id VARCHAR(255) PRIMARY KEY,
	category_name VARCHAR(50)
);

-- Tạo bảng books
CREATE TABLE books 
(
    book_id VARCHAR(255) PRIMARY KEY,
    book_name VARCHAR(255) NOT NULL,
    book_description VARCHAR(255),
    thumbnail VARCHAR(255),
    author VARCHAR(255),
    category_id VARCHAR(255),
    created_at TIMESTAMP ,
    updated_at TIMESTAMP ,
    CONSTRAINT books_fk_categories
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
);  
create table users
(
	user_id varchar(255) primary key,
    username varchar(255) unique,
    password varchar (255),
    nick_name varchar(255)
);

-- Xóa dữ liệu cũ trước khi thêm mới
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm dữ liệu vào bảng categories
INSERT INTO categories (category_id, category_name) VALUES
('C001', 'Khoa học'),
('C002', 'Văn học'),
('C003', 'Công nghệ thông tin'),
('C004', 'Kinh tế'),
('C005', 'Tâm lý học');

-- Thêm dữ liệu vào bảng books
INSERT INTO books (book_id, book_name, book_description, thumbnail, author, category_id, created_at, updated_at) VALUES
('B001', 'Vũ trụ trong lòng bàn tay', 'Khám phá bí ẩn của vũ trụ và vật lý hiện đại', 'thumb1.jpg', 'Stephen Hawking', 'C001', NOW(), NOW()),
('B002', 'Dế mèn phiêu lưu ký', 'Câu chuyện phiêu lưu đầy ý nghĩa về lòng dũng cảm', 'thumb2.jpg', 'Tô Hoài', 'C002', NOW(), NOW()),
('B003', 'Python cơ bản', 'Hướng dẫn học ngôn ngữ lập trình Python từ đầu', 'thumb3.jpg', 'Lê Minh', 'C003', NOW(), NOW()),
('B004', 'Tư duy nhanh và chậm', 'Khám phá cách bộ não con người ra quyết định', 'thumb4.jpg', 'Daniel Kahneman', 'C005', NOW(), NOW()),
('B005', 'Kinh tế học vi mô', 'Giới thiệu khái niệm cơ bản về cung cầu và thị trường', 'thumb5.jpg', 'Paul Samuelson', 'C004', NOW(), NOW());

select * from books
 SELECT `book_id` AS `bookId`, `book_name` AS `bookName`, `book_description` AS `bookDescription`, `thumbnail`, `author`, `category_id` AS `categoryId`, `created_at` AS `createdAt`, `updated_at` AS `updatedAt` FROM `books` AS `Book`;

 SELECT `book_id` AS `bookId`, `book_name` AS `bookName`, `book_description` AS `bookDescription`, `thumbnail`, `author`, `category_id` AS `categoryId`, `created_at` AS `createdAt`, `updated_at` AS `updatedAt` FROM `books` AS `Book`;