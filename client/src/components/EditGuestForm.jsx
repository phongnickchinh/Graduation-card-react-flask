import { useEffect, useState } from 'react';
import guestApi from '../services/guestApi';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Sửa thông tin khách mời</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Tên thật *</label>
                        <input
                            type="text"
                            name="realname"
                            value={formData.realname}
                            onChange={handleInputChange}
                            className="w-full border px-2 py-1 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Nickname *</label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="w-full border px-2 py-1 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border px-2 py-1 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border px-2 py-1 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Facebook</label>
                        <input
                            type="text"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleInputChange}
                            className="w-full border px-2 py-1 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Thêm ảnh</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                        
                        {/* Display existing images (read-only) */}
                        {guest && guest.images && guest.images.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium mb-2">Ảnh hiện tại ({guest.images.length}):</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {guest.images.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img 
                                                src={img.image_url} 
                                                alt={`Existing ${index}`} 
                                                className="w-full h-24 object-cover rounded border-2 border-gray-300"
                                            />
                                            <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1 rounded-br">
                                                Hiện tại
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* New Images to be added */}
                        {images.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium mb-2">Ảnh mới sẽ thêm ({images.length}):</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={img.url} 
                                                alt={`Image ${index}`} 
                                                className="w-full h-24 object-cover rounded"
                                            />
                                            <div className="absolute top-0 left-0 bg-black bg-opacity-20 text-white text-xs px-1 rounded-br">
                                                {img.isExisting ? 'Có sẵn' : 'Mới'}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
