import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Cấu hình axios instance
const api = axios.create({
    baseURL: `${API_URL}/api`
});

// --- CÁC COMPONENT GIAO DIỆN PHỤ ---

const LikeButton = ({ post, token, onLikeToggle }) => {
    const handleLike = async () => {
        try {
            await api.post(`/posts/${post.id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
            onLikeToggle(post.id);
        } catch (error) {
            console.error("Lỗi khi thích bài viết:", error);
            alert("Bạn cần đăng nhập để thực hiện hành động này.");
        }
    };
    return (
        <button onClick={handleLike} className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-200 ${post.is_liked_by_user ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
            <span>{post.like_count} Thích</span>
        </button>
    );
};

const CommentForm = ({ post, token, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        try {
            const response = await api.post(`/posts/${post.id}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` } });
            onCommentAdded(post.id, response.data);
            setContent('');
        } catch (error) {
            console.error("Lỗi khi bình luận:", error);
            alert("Bạn cần đăng nhập để bình luận.");
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex space-x-2 pt-2">
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết bình luận..." className="flex-1 border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="text-blue-600 font-semibold text-sm hover:text-blue-800">Gửi</button>
        </form>
    );
};

// --- CÁC COMPONENT TRANG CHÍNH ---

const LoginPage = ({ setToken, setUser, setView }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', { username, password });
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
                {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Tên người dùng</label>
                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên người dùng" className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Mật khẩu</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******************" className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="flex items-center justify-between">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full">Đăng nhập</button>
                </div>
                <p className="text-center text-gray-500 text-xs mt-4">Chưa có tài khoản? <button onClick={() => setView('register')} className="font-bold text-blue-500 hover:text-blue-800">Đăng ký ngay</button></p>
            </form>
        </div>
    );
};

const RegisterPage = ({ setView }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        try {
            await api.post('/register', { username, password });
            setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
            setTimeout(() => setView('login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>
                {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">{error}</p>}
                {success && <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4">{success}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-username">Tên người dùng</label>
                    <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên người dùng" className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-password">Mật khẩu</label>
                    <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******************" className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="flex items-center justify-between">
                    <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full">Đăng ký</button>
                </div>
                <p className="text-center text-gray-500 text-xs mt-4">Đã có tài khoản? <button onClick={() => setView('login')} className="font-bold text-blue-500 hover:text-blue-800">Đăng nhập</button></p>
            </form>
        </div>
    );
};

const FeedPage = ({ token, user, setToken, setUser }) => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const fileInputRef = useRef(null);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await api.get('/posts', { headers: { Authorization: `Bearer ${token}` } });
            setPosts(response.data);
        } catch (err) {
            console.error("Không thể tải bài viết:", err);
        }
    }, [token]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !newPostImage) return;
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (newPostImage) {
            formData.append('post_image', newPostImage);
        }
        try {
            const response = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
            setPosts([response.data, ...posts]);
            setNewPostContent('');
            setNewPostImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("Lỗi khi đăng bài:", err);
        }
    };

    const onLikeToggle = (postId) => setPosts(posts.map(p => p.id === postId ? { ...p, like_count: p.is_liked_by_user ? p.like_count - 1 : p.like_count + 1, is_liked_by_user: !p.is_liked_by_user } : p));
    const onCommentAdded = (postId, newComment) => setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Happy</h1>
                <div className="text-right">
                    <p className="font-semibold text-gray-700">Chào, {user.username}!</p>
                    <button onClick={handleLogout} className="text-sm text-blue-500 hover:underline">Đăng xuất</button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <form onSubmit={handlePostSubmit}>
                    <textarea className="w-full p-2 border-b border-gray-200 focus:outline-none" rows="3" placeholder={`Bạn đang nghĩ gì, ${user.username}?`} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></label>
                            <input id="file-upload" type="file" className="hidden" ref={fileInputRef} onChange={(e) => setNewPostImage(e.target.files[0])} accept="image/*" />
                            {newPostImage && <span className="text-sm text-gray-500 ml-2">{newPostImage.name}</span>}
                        </div>
                        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">Đăng</button>
                    </div>
                </form>
            </div>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md">
                        <div className="p-4">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">{post.username.charAt(0).toUpperCase()}</div>
                                <div>
                                    <p className="font-semibold text-gray-900">{post.username}</p>
                                    <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                            <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                        </div>
                        {post.image_url && (<img src={`${API_URL}/${post.image_url}`} alt="" className="w-full h-auto object-cover bg-gray-100" />)}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex justify-start space-x-6">
                                <LikeButton post={post} token={token} onLikeToggle={onLikeToggle} />
                                <div className="flex items-center space-x-2 text-sm text-gray-500 font-semibold"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg><span>{post.comments.length} Bình luận</span></div>
                            </div>
                            <div className="mt-3">
                                {post.comments.map(comment => (<div key={comment.id} className="text-sm mb-1.5"><span className="font-semibold text-gray-800">{comment.username}</span><span className="text-gray-600 ml-2">{comment.content}</span></div>))}
                                <CommentForm post={post} token={token} onCommentAdded={onCommentAdded} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [view, setView] = useState('login'); 

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    let currentView;
    if (token && user) {
        currentView = <FeedPage token={token} user={user} setToken={setToken} setUser={setUser} />;
    } else if (view === 'register') {
        currentView = <RegisterPage setView={setView} />;
    } else {
        currentView = <LoginPage setToken={setToken} setUser={setUser} setView={setView} />;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-4">
            {currentView}
        </div>
    );
}

export default App;