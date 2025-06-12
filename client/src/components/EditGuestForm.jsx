import { useEffect, useState } from 'react';
import guestApi from '../services/guestApi';
import './GuestForms.css';

export default function EditGuestForm({ open, onClose, guest, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        realname: '',
        nickname: '',
        email: '',
        phone: '',
        facebook: '',
    });
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (guest) {
            setFormData({
                id: guest.id || '',
                realname: guest.realname || '',
                nickname: guest.nickname || '',
                email: guest.email || '',
                phone: guest.phone || '',
                facebook: guest.facebook || '',
            });
            // Don't auto-populate images, start with empty array
            setImages([]);
            setError(''); // Reset error
        }
    }, [guest]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0]; // Only take the first file
        
        // Add the new image
        const newImageObject = {
            id: null,
            url: URL.createObjectURL(file),
            file: file,
            isExisting: false
        };
        
        setImages(prev => [...prev, newImageObject]);
        
        // Clear the input to allow selecting the same file again
        e.target.value = '';
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => {
            const imageToRemove = prev[indexToRemove];
            // Clean up object URL if it's a new image
            if (imageToRemove && !imageToRemove.isExisting && imageToRemove.url) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.realname || !formData.nickname) {
            setError('Tên thật và nickname là bắt buộc');
            return;
        }

        setLoading(true);
        setError(''); 
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id', formData.id);
            formDataToSend.append('realname', formData.realname);
            formDataToSend.append('nickname', formData.nickname);
            if (formData.email) formDataToSend.append('email', formData.email);
            if (formData.phone) formDataToSend.append('phone', formData.phone);
            if (formData.facebook) formDataToSend.append('facebook', formData.facebook);
            
            // Process all images - for existing ones, send their IDs
            const existingImageIds = [];
            
            images.forEach(image => {
                if (image.isExisting) {
                    // For existing images, add ID to the list (avoid duplicates)
                    if (!existingImageIds.includes(image.id)) {
                        existingImageIds.push(image.id);
                        formDataToSend.append('existing_images', image.id);
                    }
                } else if (image.file) {
                    // For new images, add the file
                    formDataToSend.append('images', image.file);
                }
            });
            
            console.log("Submitting with images:", images.length);
            
            const res = await guestApi.updateGuest(formDataToSend);
            onSuccess(res.data);
            onClose();
        } catch (err) {
            setError('Không thể cập nhật khách mời.');
            console.error('Error updating guest:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2 className="modal-title">Sửa thông tin khách mời</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên thật *</label>
                        <input
                            type="text"
                            name="realname"
                            value={formData.realname}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nickname *</label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Facebook</label>
                        <input
                            type="text"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Thêm ảnh</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                        />
                        
                        {/* Display existing images (read-only) */}
                        {guest && guest.images && guest.images.length > 0 && (
                            <div className="image-section">
                                <div className="image-section-title">Ảnh hiện tại ({guest.images.length}):</div>
                                <div className="image-grid">
                                    {guest.images.map((img, index) => (
                                        <div key={index} className="image-item">
                                            <img 
                                                src={img.image_url} 
                                                alt={`Existing ${index}`} 
                                                className="image-preview image-existing"
                                            />
                                            <div className="image-badge badge-current">
                                                Hiện tại
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* New Images to be added */}
                        {images.length > 0 && (
                            <div className="image-section">
                                <div className="image-section-title">Ảnh mới sẽ thêm ({images.length}):</div>
                                <div className="image-grid">
                                    {images.map((img, index) => (
                                        <div key={index} className="image-item">
                                            <img 
                                                src={img.url} 
                                                alt={`Image ${index}`} 
                                                className="image-preview image-new"
                                            />
                                            <div className="image-badge badge-new">
                                                {img.isExisting ? 'Có sẵn' : 'Mới'}
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
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-submit"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
