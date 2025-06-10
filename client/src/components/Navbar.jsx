// src/components/Navbar.jsx
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth(); // user tồn tại nếu đã đăng nhập
    const location = useLocation();
    const params = useParams();

    const isGuest = location.pathname.includes('/invitation') || location.pathname.includes('/guestbook') || location.pathname.includes('/story');
    const nickname = params.nickname;

    return (
    <nav className="w-full bg-white shadow px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-pink-600">
            Thiệp Mời
        </Link>

        {/* Guest View */}
        {isGuest && nickname && (
            <div className="flex gap-4 text-gray-700 text-sm font-medium">
            <Link to={`/invitation/${nickname}`} className="hover:text-pink-500">Thiệp mời</Link>
            <Link to={`/guestbook/${nickname}`} className="hover:text-pink-500">Lưu bút</Link>
            <Link to={`/story/${nickname}`} className="hover:text-pink-500">Câu chuyện</Link>
            </div>
        )}

        {/* Admin/User View */}
        {user && (
            <div className="flex gap-4 text-gray-700 text-sm font-medium items-center">
            <Link to={`/user/${user.username}/guests`} className="hover:text-pink-500">Thiệp mời</Link>
            <Link to={`/user/${user.username}/stories`} className="hover:text-pink-500">Story</Link>
            <Link to={`/user/${user.username}/guestbook`} className="hover:text-pink-500">Lưu bút</Link>
            <button
                onClick={logout}
                className="ml-4 text-red-500 hover:underline text-sm"
            >
                Đăng xuất
            </button>
            </div>
        )}
        </div>
    </nav>
    );
}
