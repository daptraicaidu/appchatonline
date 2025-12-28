import { useState } from 'react';
import './AdminPage.css'; // Sẽ tạo file này sau

const AdminPage = () => {
    const [token, setToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            // Gọi API Backend
            const response = await fetch(`http://localhost:5219/api/admin/feedbacks?token=${token}`);
            
            if (response.ok) {
                const data = await response.json();
                setFeedbacks(data);
                setIsAuthenticated(true);
            } else {
                // Nếu lỗi 401 hoặc 429
                const msg = await response.text();
                setError(msg || 'Xác thực thất bại');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Giao diện khi chưa đăng nhập
    if (!isAuthenticated) {
        return (
            <div className="admin-container">
                <div className="login-box">
                    <h2>Admin Verify</h2>
                    <input 
                        type="password" 
                        placeholder="Nhập Token quản trị..." 
                        value={token}
                        onChange={e => setToken(e.target.value)}
                    />
                    {error && <p className="error-msg">{error}</p>}
                    <button onClick={handleVerify} disabled={loading}>
                        {loading ? 'Đang kiểm tra...' : 'Truy cập'}
                    </button>
                </div>
            </div>
        );
    }

    // Giao diện khi đã đăng nhập (Bảng Feedback)
    return (
        <div className="admin-dashboard">
            <header>
                <h1>Danh sách Góp ý</h1>
                <button onClick={() => window.location.reload()}>Đăng xuất</button>
            </header>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Người gửi</th>
                            <th>Nội dung</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map(fb => (
                            <tr key={fb.id}>
                                <td>{fb.id}</td>
                                <td>{fb.user}</td>
                                <td>{fb.content}</td>
                                <td>{formatDate(fb.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {feedbacks.length === 0 && <p style={{textAlign:'center', marginTop: 20}}>Chưa có góp ý nào.</p>}
            </div>
        </div>
    );
};

export default AdminPage;