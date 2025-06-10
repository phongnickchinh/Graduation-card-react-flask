import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import guestApi from '../../services/guestApi';

import Navbar from '../../components/Navbar';
import "./ResponsiveImage.css";

import background_card from '../../assets/selected_card.png';

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
    const timeout = setTimeout(adjustHeight, 200);

    window.addEventListener('resize', adjustHeight);
    return () => {
    clearTimeout(timeout);
    window.removeEventListener('resize', adjustHeight);
    };
}, []);



    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (notFound) return <div className="text-center mt-10 text-red-500">Sorry we can't find you, maybe try other nickname.</div>;

    return (
    <>
        <div ref={navbarRef}>
            <Navbar />
        </div>

        <div className="image-container" ref={imageContainerRef}>
        <img src={background_card} alt="Ảnh nền" className="responsive-img" />
        <img
            src={guest.images[0].image_url}
            alt="Tên khách"
            className="overlay-img"
        />
        </div>
    </>
    );
}
