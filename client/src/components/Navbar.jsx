import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
    <nav className="w-full bg-white shadow-md px-4 py-3" id="navbar1">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo hoặc tiêu đề */}
        <Link to="/" className="text-xl font-bold text-pink-600">
            Thiệp Mời
        </Link>

        {/* Menu điều hướng – luôn nằm ngang */}
        <div className="flex gap-6 text-gray-700 text-sm font-medium">
            <Link to="/" className="hover:text-pink-500">Trang chủ</Link>
            <Link to="/guests" className="hover:text-pink-500">Khách mời</Link>
            <Link to="/admin" className="hover:text-pink-500">Quản lý</Link>
        </div>
        </div>
    </nav>
    );
}
