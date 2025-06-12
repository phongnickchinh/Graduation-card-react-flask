// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth(); // user tồn tại nếu đã đăng nhập
    const location = useLocation();
    const params = useParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isGuest = location.pathname.includes('/invitation') || location.pathname.includes('/guestbook') || location.pathname.includes('/story');
    const nickname = params.nickname;

    const openMenu = () => setIsMenuOpen(true);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLinkClick = () => {
        closeMenu();
    };

    const handleLogout = () => {
        logout();
        closeMenu();
    };

    return (
        <>
            {/* Top Bar */}
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Menu Button */}
                    <button
                        onClick={openMenu}
                        className="menu-toggle"
                        title="Mở menu"
                    >
                        <img 
                            src="/src/assets/menu.png" 
                            alt="Menu"
                            className="menu-icon"
                        />
                    </button>
                </div>
            </nav>

            {/* Overlay Menu */}
            <div className={`overlay-menu ${isMenuOpen ? 'open' : ''}`}>
                {/* Close Button */}
                <button
                    onClick={closeMenu}
                    className="close-btn"
                >
                                            <img 
                            src="/src/assets/menu_close.png" 
                            alt="Menu"
                            className="menu-close-icon"
                        />
                </button>

                {/* Menu Content */}
                <div className="overlay-content">
                    {/* Guest View - Ưu tiên hiển thị khi đang ở trang guest */}
                    {isGuest && nickname ? (
                        <>
                            <Link
                                to={`/invitation/${nickname}`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/navbar/invitation.png" 
                                    alt="Thiệp mời"
                                />
                            </Link>
                            <Link
                                to={`/guestbook/${nickname}`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/navbar/guestbook.png" 
                                    alt="Lưu bút"
                                />
                            </Link>
                            <Link
                                to={`/story/${nickname}`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/navbar/myStory.png" 
                                    alt="Câu chuyện"
                                />
                            </Link>
                        </>
                    ) : user ? (
                        /* Admin/User View - Chỉ hiển thị khi không phải trang guest */
                        <>
                            <Link
                                to={`/user/${user.username}/guests`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/selected_card.png" 
                                    alt="Thiệp mời"
                                />
                            </Link>
                            <Link
                                to={`/user/${user.username}/stories`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/react.svg" 
                                    alt="Story"
                                />
                            </Link>
                            <Link
                                to={`/user/${user.username}/guestbook`}
                                onClick={handleLinkClick}
                                className="menu-item"
                            >
                                <img 
                                    src="/src/assets/Frame 10.png" 
                                    alt="Lưu bút"
                                />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
