import React from 'react';
import './GuestMyStories.css';
import Navbar from '../../components/Navbar';

const GuestMyStories = () => {
  return (
    <>
      <Navbar />
      <div className="guest-mystery-container">
        <div className="guest-mystery-message">
          <h2>Chuyến phiêu lưu chưa được hoàn thành</h2>
          <p>Vui lòng quay lại sau</p>
        </div>
      </div>
    </>
  );
};

export default GuestMyStories;