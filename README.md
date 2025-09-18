🚀 Dự án Mạng Xã Hội Đơn Giản (React & Node.js)Một dự án web application mạng xã hội cơ bản, được xây dựng để minh họa cách hoạt động của một ứng dụng full-stack sử dụng React cho frontend, Node.js/Express cho backend và MySQL làm cơ sở dữ liệu.✨ Các tính năng chínhXác thực người dùng: Đăng ký và đăng nhập tài khoản an toàn sử dụng JSON Web Tokens (JWT). Mật khẩu được mã hóa bằng bcrypt.Tạo bài đăng: Người dùng sau khi đăng nhập có thể tạo bài đăng mới bao gồm nội dung văn bản và một hình ảnh.Bảng tin (News Feed): Xem danh sách tất cả các bài đăng từ mọi người dùng, được sắp xếp theo thời gian mới nhất.Tương tác:Thích / Bỏ thích bài viết.Bình luận vào bài viết.Giao diện đáp ứng (Responsive): Giao diện được xây dựng với Tailwind CSS để có thể xem tốt trên nhiều thiết bị.🛠️ Công nghệ sử dụngLĩnh vựcCông nghệFrontendReact.js, Tailwind CSS, AxiosBackendNode.js, Express.js, JWT, Bcrypt.js, MulterCơ sở dữ liệuMySQL, MySQL2 Driver🚀 Hướng dẫn Cài đặt và Chạy dự án✅ Yêu cầuNode.js (phiên bản 14.x trở lên)npm (thường đi kèm với Node.js)MySQL Server đang chạy1. Cài đặt Cơ sở dữ liệuMở công cụ quản lý MySQL của bạn (MySQL Workbench, phpMyAdmin, etc.).Chạy đoạn mã SQL sau để tạo database và các bảng cần thiết:-- Tạo database nếu nó chưa tồn tại
CREATE DATABASE IF NOT EXISTS social_media_db;

-- Chọn database để làm việc
USE social_media_db;

-- Tạo bảng 'users'
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng 'posts'
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo bảng 'likes'
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id)
);

-- Tạo bảng 'comments'
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
2. Cài đặt BackendDi chuyển vào thư mục backend:cd backend
Cài đặt các gói phụ thuộc:npm install
Quan trọng: Tạo một thư mục con tên là uploads bên trong thư mục backend.mkdir uploads
Mở tệp server.js và cập nhật thông tin kết nối MySQL của bạn, đặc biệt là password.const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', // <-- THAY MẬT KHẨU CỦA BẠN VÀO ĐÂY
    database: 'social_media_db',
    // ...
});
Khởi động server backend:node server.js
✅ Server sẽ chạy tại http://localhost:3001.3. Cài đặt FrontendMở một cửa sổ terminal mới và di chuyển vào thư mục frontend:cd frontend
Cài đặt các gói phụ thuộc:npm install
Khởi động ứng dụng React:npm start
✅ Ứng dụng sẽ tự động mở trong trình duyệt của bạn tại http://localhost:3000.Bây giờ bạn có thể đăng ký tài khoản và bắt đầu sử dụng!🔮 Các hướng phát triển trong tương lai[ ] Trang cá nhân cho người dùng.[ ] Chỉnh sửa / Xóa bài đăng và bình luận.[ ] Hệ thống theo dõi (Follow/Unfollow).[ ] Thông báo thời gian thực (real-time notifications).[ ] Nhắn tin trực tiếp.