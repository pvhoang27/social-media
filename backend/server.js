/*
 * Tệp: server.js
 * Chức năng: Máy chủ backend cho mạng xã hội.
 * Bao gồm: Đăng ký, Đăng nhập, Đăng bài (text + ảnh), Like, Comment.
 */

// 1. Khai báo các thư viện
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Thư viện xử lý upload file
const path = require('path'); // Module có sẵn của Node.js để làm việc với đường dẫn

// 2. Khởi tạo và Cấu hình
const app = express();
const port = 3001;
const JWT_SECRET = 'hoang2001'; //key bí mật để bảo vệ acc


// 3. Middleware
app.use(cors());
app.use(bodyParser.json());
// Phục vụ các file tĩnh từ thư mục 'uploads'
// Ví dụ: truy cập http://localhost:3001/uploads/ten_file_anh.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Cấu hình Multer cho việc upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu file, bạn phải tự tạo thư mục này
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất: fieldname-timestamp.extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 5. Cấu hình kết nối MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'hoang2001', // << THAY MẬT KHẨU CỦA BẠN VÀO ĐÂY
    database: 'social_media_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Middleware xác thực token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- CÁC API ENDPOINTS ---

// API Đăng ký
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên người dùng và mật khẩu." });
    }
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Tên người dùng đã tồn tại." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên người dùng và mật khẩu." });
    }
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Tên người dùng hoặc mật khẩu không đúng." });
        }
        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Tên người dùng hoặc mật khẩu không đúng." });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// API Lấy tất cả bài đăng
app.get('/api/posts', async (req, res) => {
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (user) currentUserId = user.id;
        });
    }
    try {
        const query = `
            SELECT
                p.id, p.content, p.image_url, p.created_at, u.username,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
                ${currentUserId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${currentUserId}) > 0 AS is_liked_by_user` : '0 AS is_liked_by_user'}
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC;
        `;
        const [posts] = await db.query(query);
        for (const post of posts) {
            const [comments] = await db.query(`
                SELECT c.id, c.content, c.created_at, u.username
                FROM comments c JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ? ORDER BY c.created_at ASC;
            `, [post.id]);
            post.comments = comments;
            post.is_liked_by_user = !!post.is_liked_by_user;
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error("Lỗi khi lấy bài đăng:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// API Tạo bài đăng mới
app.post('/api/posts', verifyToken, upload.single('post_image'), async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;
    if (!content && !imageUrl) {
        return res.status(400).json({ message: "Bài đăng phải có nội dung hoặc hình ảnh." });
    }
    try {
        const [result] = await db.query('INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)', [userId, content || '', imageUrl]);
        const [newPostResult] = await db.query('SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?', [result.insertId]);
        const newPost = newPostResult[0];
        res.status(201).json({ ...newPost, comments: [], like_count: 0, is_liked_by_user: false });
    } catch (error) {
        console.error("Lỗi khi tạo bài đăng:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// API Like/Unlike một bài đăng
app.post('/api/posts/:postId/like', verifyToken, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    try {
        const [existingLike] = await db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
        if (existingLike.length > 0) {
            await db.query('DELETE FROM likes WHERE id = ?', [existingLike[0].id]);
            res.status(200).json({ message: "Bỏ thích thành công" });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            res.status(201).json({ message: "Thích thành công" });
        }
    } catch (error) {
        console.error("Lỗi khi like/unlike:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// API Thêm bình luận
app.post('/api/posts/:postId/comments', verifyToken, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content) {
        return res.status(400).json({ message: "Nội dung bình luận không được để trống." });
    }
    try {
        const [result] = await db.query('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [userId, postId, content]);
        const [newComment] = await db.query('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?', [result.insertId]);
        res.status(201).json(newComment[0]);
    } catch (error) {
        console.error("Lỗi khi bình luận:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});

// Khởi động máy chủ
app.listen(port, () => {
    console.log(`Backend server đang chạy tại http://localhost:${port}`);
});