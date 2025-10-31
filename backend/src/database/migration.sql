DROP DATABASE IF EXISTS electronics_app;
CREATE DATABASE electronics_app;
USE electronics_app;

-- =========================================================
-- Bảng Users
-- =========================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- Bảng Stores (Cửa hàng của seller)
-- =========================================================
CREATE TABLE stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Categories (Danh mục sản phẩm)
-- =========================================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- Bảng Products (Sản phẩm)
-- =========================================================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- =========================================================
-- Bảng Product_Images (Hỗ trợ nhiều ảnh sản phẩm)
-- =========================================================
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Cart_Items (Giỏ hàng)
-- =========================================================
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Orders (Đơn hàng)
-- =========================================================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','processing','shipping','completed','cancelled') DEFAULT 'pending',
    address VARCHAR(255) NOT NULL,
    payment_method ENUM('cash','bank_transfer','other') DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Order_Items (Chi tiết đơn hàng)
-- =========================================================
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Reviews (Đánh giá sản phẩm)
-- =========================================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================================================
-- Bảng Chat_Messages (Tin nhắn Buyer ↔ Seller)
-- =========================================================
CREATE TABLE chat_messages (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    message TEXT NOT NULL,
    sender ENUM('buyer','seller') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

