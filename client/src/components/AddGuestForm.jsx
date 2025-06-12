import { useState } from 'react';
import guestApi from '../services/guestApi';
import './GuestForms.css';

export default function AddGuestModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ realname: '', nickname: '' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Clean up previous object URLs
    images.forEach(img => {
      if (img.url) {
        URL.createObjectURL(img.url);
      }
    });
    
    // Create new image objects with preview URLs
    const newImages = Array.from(e.target.files).map(file => ({
      file: file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImages(newImages);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => {
      const imageToRemove = prev[indexToRemove];
      // Clean up object URL
      if (imageToRemove && imageToRemove.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.realname || !form.nickname) {
      setError('Vui lòng nhập đầy đủ thông tin tên thật và nickname.');
      return;
    }

    const formData = new FormData();
    formData.append('realname', form.realname);
    formData.append('nickname', form.nickname);
    images.forEach((img) => formData.append('images', img.file));

    setLoading(true);
    try {
      const res = await guestApi.addGuest(formData);
      onSuccess && onSuccess(res.data);
      setForm({ realname: '', nickname: '' });
      // Clean up object URLs before clearing images
      images.forEach(img => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
      setImages([]);
      onClose(); // đóng modal sau khi thành công
    } catch (err) {
      console.error(err);
      setError('Thêm khách mời thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button
          onClick={onClose}
          className="modal-close-btn"
        >
          &times;
        </button>

        <h3 className="modal-title">Thêm khách mời mới</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên thật *</label>
            <input
              type="text"
              name="realname"
              value={form.realname}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nickname *</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ảnh</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file-input"
            />
            <div className="form-help-text">Có thể chọn nhiều ảnh.</div>
            
            {/* Display image previews */}
            {images.length > 0 && (
              <div className="image-section">
                <div className="image-section-title">Ảnh đã chọn ({images.length}):</div>
                <div className="image-grid">
                  {images.map((img, index) => (
                    <div key={index} className="image-item">
                      <img 
                        src={img.url} 
                        alt={`Preview ${index}`} 
                        className="image-preview image-new"
                      />
                      <div className="image-badge badge-new">
                        Mới
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="image-remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-submit"
            >
              {loading ? 'Đang thêm...' : 'Thêm khách mời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
