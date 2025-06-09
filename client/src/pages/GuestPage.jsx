import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import guestApi from '../services/guestApi';

import "./ResponsiveImage.css";
import Navbar from '../components/Navbar';

import background_card from '../assets/selected_card.png';
import test_guest_name from '../assets/Frame 10.png'; // bạn có thể thay bằng ảnh động

export default function GuestPage() {
    const { nickname } = useParams();
    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const navbarRef = useRef(null);
    const imageContainerRef = useRef(null);

    useEffect(() => {
    const fetchGuest = async () => {
        try {
        const res = await guestApi.getGuestByNickname(nickname);
        setGuest(res.data);
        } catch (err) {
        setNotFound(true);
        } finally {
        setLoading(false);
        }
    };
    fetchGuest();
    }, [nickname]);

useEffect(() => {
    const adjustHeight = () => {
    if (
        navbarRef.current &&
        imageContainerRef.current &&
        window.innerHeight / window.innerWidth < 1.414
    ) {
        const navbarHeight = navbarRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        //set chieu rong cua overlay-img
        const overlayImg = document.querySelector('.overlay-img');
        if (overlayImg) {
            overlayImg.style.width = `${window.innerHeight / 1.414 * 0.8}px`;
        }
        imageContainerRef.current.style.height = `${windowHeight - navbarHeight}px`;
    } else if (imageContainerRef.current) {
        // Bỏ style height đã set trước đó nếu điều kiện không còn đúng
        imageContainerRef.current.style.height = '';
        const overlayImg = document.querySelector('.overlay-img');
        //loại bỏ style width đã set trước đó
        if (overlayImg) {
            overlayImg.style.width = '';
        }
    }
    };

    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
}, []);


    if (loading) return <div className="text-center mt-10">Đang tải...</div>;
    if (notFound) return <div className="text-center mt-10 text-red-500">Không tìm thấy khách mời.</div>;

    return (
    <>
        <div ref={navbarRef}>
            <Navbar />
        </div>

        <div className="image-container" ref={imageContainerRef}>
        <img src={background_card} alt="Ảnh nền" className="responsive-img" />

        {/* Ảnh thứ 2: nằm ở 40% chiều cao, căn giữa ngang */}
        <img
            src={test_guest_name} // bạn có thể thay bằng ảnh động
            alt="Tên khách"
            className="overlay-img"
        />
        </div>
    </>
    );
}
