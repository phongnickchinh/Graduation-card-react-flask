import React, { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import guestBookApi from '../../services/guestBookApi';
import './GuestBookPage.css';

import formButton from '../../assets/formButton.png'; // Placeholder for form button image
import laspage from '../../assets/lastpage.png'; // Placeholder for last page icon
import bookCover from '../../assets/luubut.png'; // Placeholder for book cover image
import next from '../../assets/next.png'; // Placeholder for next page icon
import prev from '../../assets/prev.png'; // Placeholder for previous page icon

// Page component for the flip book
const Page = React.forwardRef((props, ref) => {
  return (
    <div className="book-page" ref={ref}>
      <div className="page-content">
        {props.children}
      </div>
      {props.number > 0 && (
        <div className="page-number-display">
          Trang {Math.floor(props.number / 2) + 1}
        </div>
      )}
    </div>
  );
});

const GuestBookPage = () => {
  const { username, nickname } = useParams();
  const [guestBooks, setGuestBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showNavigationHelp, setShowNavigationHelp] = useState(true);
  const [formData, setFormData] = useState({
    guest_name: '',
    content: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ 
    status: null, // 'success', 'error'
    message: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flipBookRef = useRef(null);
  
  // Hàm riêng để fetch guestbooks để có thể tái sử dụng
  const fetchGuestBooks = async () => {
    try {
      setLoading(true);
      const response = await guestBookApi.getGuestBooksByUsernameGuestSide(username);
      // Sort by created_at descending (older entries first)
      const sortedGuestBooks = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      setGuestBooks(sortedGuestBooks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guestbooks:', err);
      setError('Không thể tải lưu bút. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all guestbooks for this username
    fetchGuestBooks();
  }, [username]);

  // Effect to hide navigation help after 10 seconds
  useEffect(() => {
    if (showNavigationHelp) {
      const timer = setTimeout(() => {
        setShowNavigationHelp(false);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showNavigationHelp]);

  // Function to handle clicks on the navigation overlay
  const handleNavigationHelpClick = () => {
    setShowNavigationHelp(false);
  };

  // Calculate pages - 2 entries per page
  const getPages = () => {
    const pages = [];
    
    // Cover page
    pages.push(
      <Page key="cover" number={0}>
        <div className="book-cover">
          <img src={bookCover} alt="Cover"  style={{ width: '100%', height: 'auto' }} />
        </div>
      </Page>
    );
    
    // Content pages, 2 messages per page, arranged one above the other
    for (let i = 0; i < guestBooks.length; i += 2) {
      const topEntry = guestBooks[i];
      const bottomEntry = guestBooks[i+1]; // Might be undefined
      
      pages.push(
        <Page key={i + 1} number={i + 1}>
          <div className="book-page-content">
            <div className="page-entries">
              <div className="entry">
                {topEntry && (
                  <div className="guestbook-entry">
                    <div className="entry-header">
                      <h3 className="guest-name">{topEntry.guest_name}</h3>
                      {/* <span className="date">{formatDate(topEntry.created_at)}</span> */}
                    </div>
                    <div className="entry-content-container">
                      <p className="entry-content">{topEntry.content}</p>
                      <div className="entry-image">
                        {topEntry.image ? (
                          <img src={topEntry.image} alt={`Hình ảnh từ ${topEntry.guest_name}`} />
                        ) : (
                          <div className="placeholder-image"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="entry">
                {bottomEntry && (
                  <div className="guestbook-entry">
                    <div className="entry-header">
                      <h3 className="guest-name">{bottomEntry.guest_name}</h3>
                      {/* <span className="date">{formatDate(bottomEntry.created_at)}</span> */}
                    </div>
                    <div className="entry-content-container">
                      <p className="entry-content">{bottomEntry.content}</p>
                      <div className="entry-image">
                        {bottomEntry.image ? (
                          <img src={bottomEntry.image} alt={`Hình ảnh từ ${bottomEntry.guest_name}`} />
                        ) : (
                          <div className="placeholder-image"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Page>
      );
    }
    
    // Add a final page for the form
    pages.push(
      <Page key="last">
        <div className="form-page">
          <p className='form-description'>Khoảng khắc qua đi nhưng kỉ niệm còn mãi. Hãy viết gì đó cho mình nhé!</p>
          <button
            className="add-guestbook-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <img src={formButton} alt="Form Button" />
            {showForm ? 'Ẩn biểu mẫu' : ''}
          </button>
        </div>
      </Page>
    );
    
    return pages;
  };

  // Format the date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const removeImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setFormData({
      ...formData,
      image: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ status: null, message: '' });

    if (!formData.guest_name) {
      alert('Chưa nhập tên của bạn');
      return;
    }

    if (!formData.content) {
      alert('Bạn chưa viết gì cả :-(');
      return;
    }

    // Vô hiệu hóa nút submit để tránh gửi nhiều lần
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('guest_name', formData.guest_name);
      data.append('content', formData.content);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await guestBookApi.createGuestBookAsGuest(username, data);
      
      // Reset form
      setFormData({
        guest_name: '',
        content: '',
        image: null
      });
      removeImage();
      setShowForm(false);
      setSubmitStatus({ status: 'success', message: 'Lưu bút đã được gửi thành công!' });

      // Load lại dữ liệu từ API để cập nhật danh sách guestbook
      await fetchGuestBooks();

      // Go to cover to show new entry
      if (flipBookRef.current) {
        flipBookRef.current.pageFlip().turnToPage(0);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus({ status: null, message: '' });
      }, 3000);

    } catch (err) {
      console.error('Error submitting guestbook:', err);
      setSubmitStatus({ status: 'error', message: 'Không thể gửi lưu bút. Vui lòng thử lại sau.' });
    } finally {
      // Kích hoạt lại nút submit sau khi đã xử lý xong
      setIsSubmitting(false);
    }
  };

  // Page flip event handlers
  const onFlip = (e) => {
    const pageIndex = e.data;
    setCurrentPage(pageIndex);
    
    // Update page numbers on each page
    const pages = document.querySelectorAll('.page-number-display');
    pages.forEach((pageElement, index) => {
      if (index === pageIndex) {
        pageElement.classList.add('active');
      } else {
        pageElement.classList.remove('active');
      }
    });
  };

  // Function to navigate to the last page using flipNext()
  const goToLastPage = () => {
    const totalPages = Math.ceil(guestBooks.length / 2) + 2;
    const pagesRemaining = totalPages - currentPage - 1;
    
    if (pagesRemaining > 0) {
      // Create a loop that calls flipNext() until we reach the last page
      for (let i = 0; i < pagesRemaining; i++) {
        setTimeout(() => {
          flipBookRef.current.pageFlip().flipNext();
        }, i * 150); // Add a small delay between flips for animation effect
      }
    }
  };

  return (
  <>
    <div>
        <Navbar />
    </div>
    <div className="guestbook-page">
      {submitStatus.status && (
        <div className={`status-message ${submitStatus.status}`}>
          {submitStatus.message}
        </div>
      )}

      {showNavigationHelp && (
        <div className="navigation-help-modal" onClick={handleNavigationHelpClick}>
          <div className="navigation-overlay">
            <div className="nav-instruction left">
              <img src={prev} alt="Previous Page" />
            </div>
            <div className="nav-instruction right">
              <img src={next} alt="Next Page" />
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Đang tải lưu bút...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="flipbook-container">
          <HTMLFlipBook
            width={550}
            height={750}
            size="stretch"
            minWidth={315}
            maxWidth={100}
            minHeight={400}
            maxHeight={800}
            maxShadowOpacity={0.25}
            showCover={true}
            mobileScrollSupport={true}
            className="flip-book"
            ref={flipBookRef}
            onFlip={onFlip}
            useMouseEvents={true}
          >
            {getPages()}
          </HTMLFlipBook>
          
          <div className="flipbook-controls">
            <button
              onClick={goToLastPage}
              disabled={currentPage === Math.ceil(guestBooks.length / 2) + 1}
              className="flip-btn last-page-btn"
            >
              <img src={laspage} alt="Last Page" />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="guestbook-form-container">
          <form onSubmit={handleSubmit} className="guestbook-form">
            <div className="form-group">
              <label htmlFor="guest_name">Tên của bạn *</label>
              <input
                type="text"
                id="guest_name"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                // required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Lời nhắn *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Viết lời nhắn của bạn..."
                rows={4}
                // required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Tải lên một hình ảnh nhé! (Hoặc không)</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                  <button type="button" onClick={removeImage} className="remove-image">
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Huỷ
              </button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi lưu bút'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </>
  );
};

export default GuestBookPage;