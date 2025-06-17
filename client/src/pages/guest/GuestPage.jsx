import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import guestApi from '../../services/guestApi';

import Navbar from '../../components/Navbar';
import "./ResponsiveImage.css";

import background_card from '../../assets/selected_card.png';
import defaut_card from '../../assets/defaut.png';

export default function GuestPage() {
    const { username, nickname } = useParams();
    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const navbarRef = useRef(null);
    const imageContainerRef = useRef(null);


    useEffect(() => {
    const fetchGuest = async () => {
        if (!nickname) {
            // Nếu không có nickname, không cần gọi API, tra ve thiep mac dinh
            setLoading(false);
            setGuest({
                images: [{ image_url: defaut_card }],
            });
            return;
        }
        try {
        console.log(`Fetching guest for username: ${username}, nickname: ${nickname}`);
        const res = await guestApi.getGuestByNickname(username, nickname);
        setGuest(res.data);
        } catch (err) {
        console.error("Error fetching guest:", err);
        setNotFound(true);
        } finally {
        setLoading(false);
        }
    };
    fetchGuest();
    }, [username, nickname]);

useEffect(() => {
    const adjustHeight = () => {
    if (
        navbarRef.current &&
        imageContainerRef.current &&
        window.innerHeight / window.innerWidth < 1.414
    ) {
        const navbarHeight = navbarRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        const overlayImg = document.querySelector('.overlay-img');
        if (overlayImg) {
        overlayImg.style.width = `${(window.innerHeight / 1.414) * 0.8}px`;
        }

        imageContainerRef.current.style.height = `${windowHeight - navbarHeight}px`;
    } else if (imageContainerRef.current) {
        imageContainerRef.current.style.height = '';
        const overlayImg = document.querySelector('.overlay-img');
        if (overlayImg) {
        overlayImg.style.width = '';
        }
    }
    };

    // Delay gọi lần đầu 1 chút để đảm bảo ref đã gán
    const timeout = setTimeout(adjustHeight, 2000);

    window.addEventListener('resize', adjustHeight);
    return () => {
    clearTimeout(timeout);
    window.removeEventListener('resize', adjustHeight);
    };
}, []);



    if (loading) return (
        <div className="centered-message-container">
            <div className="centered-message">Mạng lag quá, xin chờ thêm chút...</div>
        </div>
    );
    if (notFound) return (
        <div className="centered-message-container">
            <div className="centered-message error-message error-message-notFound">Xin lỗi, tôi không tìm thấy bạn. Hãy thử lại với đường dẫn hoặc nickname khác.</div>
        </div>
    );

    return (
    <>
        <div ref={navbarRef}>
            <Navbar />
        </div>

        <div className="image-container" ref={imageContainerRef}>
        <img src={background_card} alt="Ảnh nền" className="responsive-img" />
        {guest.images && guest.images.length > 0 ? (
            <img
                src={guest.images[0].image_url}
                alt="Tên khách"
                className="overlay-img"
            />
        ) : (
            <div className="overlay-img" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', padding: '1rem'}}>
                <p>Không có ảnh</p>
            </div>
        )}
        </div>
    </>
    );
}
