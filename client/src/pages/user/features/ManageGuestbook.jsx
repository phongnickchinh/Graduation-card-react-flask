import { useEffect, useState } from 'react';
import { Link , useParams} from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import guestBookApi from '../../../services/guestBookApi';
import './ManageGuestbook.css';

export default function ManageGuestbook() {
    const params = useParams();
    const [guestBooks, setGuestBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGuestBookIds, setSelectedGuestBookIds] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedGuestBook, setSelectedGuestBook] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        guest_name: '',
        content: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const { user } = useAuth();
    const username = params.username || (user ? user.username : '');

    useEffect(() => {
        const fetchGuestBooks = async () => {
            try {
                const res = await guestBookApi.getAllGuestBooks();
                setGuestBooks(res.data);
            } catch (err) {
                setError('Không thể tải danh sách lưu bút.');
                console.error('Error fetching guest books:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuestBooks();
    }, []);

    const handleViewDetails = async (guestBookId) => {
        try {
            const res = await guestBookApi.getGuestBookById(guestBookId);
            setSelectedGuestBook(res.data);
            setShowDetails(true);
        } catch (err) {
            setError('Không thể tải thông tin lưu bút.');
            console.error('Error fetching guest book details:', err);
        }
    };

    const handleSelectGuestBook = (guestBookId) => {
        setSelectedGuestBookIds(prev => {
            if (prev.includes(guestBookId)) {
                return prev.filter(id => id !== guestBookId);
            } else {
                return [...prev, guestBookId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedGuestBookIds.length === guestBooks.length) {
            setSelectedGuestBookIds([]);
        } else {
            setSelectedGuestBookIds(guestBooks.map(book => book.id));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedGuestBookIds.length === 0) {
            setError('Vui lòng chọn ít nhất một lưu bút để xóa.');
            return;
        }
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await guestBookApi.deleteGuestBooks(selectedGuestBookIds);
            setGuestBooks(prev => prev.filter(book => !selectedGuestBookIds.includes(book.id)));
            setSelectedGuestBookIds([]);
            setShowDeleteConfirm(false);
            setError('');
        } catch (err) {
            setError('Không thể xóa lưu bút.');
            console.error('Error deleting guest books:', err);
        }
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

    const handleAddGuestBook = async (e) => {
        e.preventDefault();
        
        try {
            const data = new FormData();
            data.append('guest_name', formData.guest_name);
            data.append('content', formData.content);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const response = await guestBookApi.createGuestBook(data);
            
            // Add the new guestbook to the state
            setGuestBooks(prevBooks => [response.data, ...prevBooks]);
            
            // Reset form
            resetForm();
            setShowAddModal(false);
        } catch (err) {
            setError('Không thể thêm lưu bút. Vui lòng thử lại sau.');
            console.error('Error adding guestbook:', err);
        }
    };

    const handleEditGuestBook = (guestBook) => {
        setSelectedGuestBook(guestBook);
        
        setFormData({
            guest_name: guestBook.guest_name,
            content: guestBook.content,
            image: null
        });
        
        if (guestBook.image) {
            setPreviewImage(guestBook.image);
        }
        
        setShowEditModal(true);
    };

    const handleUpdateGuestBook = async (e) => {
        e.preventDefault();
        
        try {
            const data = new FormData();
            data.append('guest_name', formData.guest_name);
            data.append('content', formData.content);
            data.append('guest_book_id', selectedGuestBook.id);
            
            if (formData.image && typeof formData.image !== 'string') {
                data.append('image', formData.image);
            }

            const response = await guestBookApi.updateGuestBook(data);
            
            // Update the guestbook in the state
            setGuestBooks(prevBooks => prevBooks.map(book => 
                book.id === response.data.id ? response.data : book
            ));
            
            // Reset form
            resetForm();
            setShowEditModal(false);
            setSelectedGuestBook(null);
        } catch (err) {
            setError('Không thể cập nhật lưu bút. Vui lòng thử lại sau.');
            console.error('Error updating guestbook:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            guest_name: '',
            content: '',
            image: null
        });
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);
    };

    return (
        <div className="manage-guestbooks-container">
            <div className="header-actions">
                <div className="header-buttons-left">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                    >
                        + Thêm lưu bút
                    </button>

                    {user && (
                        <Link
                            to={`/guestbook/view/${username}`}
                            className="btn btn-secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Xem dưới vai trò khách
                        </Link>
                    )}
                </div>

                {selectedGuestBookIds.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="btn btn-danger"
                    >
                        Xóa đã chọn ({selectedGuestBookIds.length})
                    </button>
                )}
            </div>

            <h2 className="page-title">Danh sách lưu bút</h2>

            {loading && <div className="loading-text">Đang tải...</div>}
            {error && <div className="error-text">{error}</div>}

            {!loading && guestBooks.length === 0 && (
                <div className="empty-state">Chưa có lưu bút nào.</div>
            )}

            {!loading && guestBooks.length > 0 && (
                <table className="guestbooks-table">
                    <thead className="table-header">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedGuestBookIds.length === guestBooks.length && guestBooks.length > 0}
                                    onChange={handleSelectAll}
                                    className="checkbox"
                                />
                                #
                            </th>
                            <th>Người gửi</th>
                            <th>Nội dung</th>
                            <th>Ngày tạo</th>
                            <th>Hình ảnh</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guestBooks.map((book, index) => (
                            <tr key={book.id} className="table-row">
                                <td className="table-cell" data-label="STT">
                                    <input
                                        type="checkbox"
                                        checked={selectedGuestBookIds.includes(book.id)}
                                        onChange={() => handleSelectGuestBook(book.id)}
                                        className="checkbox"
                                    />
                                    {index + 1}
                                </td>
                                <td className="table-cell" data-label="Người gửi">{book.guest_name}</td>
                                <td className="table-cell content-cell" data-label="Nội dung">
                                    {book.content.length > 50 ? `${book.content.substring(0, 50)}...` : book.content}
                                </td>
                                <td className="table-cell" data-label="Ngày tạo">{formatDate(book.created_at)}</td>
                                <td className="table-cell" data-label="Hình ảnh">
                                    {book.image && (
                                        <div className="image-thumbnail">
                                            <img src={book.image} alt="Lưu bút" />
                                        </div>
                                    )}
                                </td>
                                <td className="table-cell actions-cell" data-label="Hành động">
                                    <button
                                        onClick={() => handleViewDetails(book.id)}
                                        className="btn btn-secondary btn-small"
                                        aria-label="Xem chi tiết"
                                    >
                                        Xem
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedGuestBookIds([book.id]);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="btn btn-danger btn-small"
                                        aria-label="Xóa lưu bút"
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        onClick={() => handleEditGuestBook(book)}
                                        className="btn btn-primary btn-small"
                                        aria-label="Sửa lưu bút"
                                    >
                                        Sửa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Xác nhận xóa</h3>
                        <p className="modal-text">
                            Bạn có chắc chắn muốn xóa {selectedGuestBookIds.length} lưu bút đã chọn? 
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSelectedGuestBookIds([]);
                                }}
                                className="btn btn-outline"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn btn-danger"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GuestBook Details Modal */}
            {showDetails && selectedGuestBook && (
                <div className="modal-overlay">
                    <div className="modal-content guestbook-details-modal">
                        <h3 className="modal-title">Chi tiết lưu bút</h3>
                        <div className="guestbook-details">
                            <div className="detail-row">
                                <span className="detail-label">Người gửi:</span>
                                <span className="detail-value">{selectedGuestBook.guest_name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ngày tạo:</span>
                                <span className="detail-value">{formatDate(selectedGuestBook.created_at)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nội dung:</span>
                                <div className="detail-value content-full">{selectedGuestBook.content}</div>
                            </div>
                            {selectedGuestBook.image && (
                                <div className="detail-row">
                                    <span className="detail-label">Hình ảnh:</span>
                                    <div className="detail-value">
                                        <div className="image-full">
                                            <img src={selectedGuestBook.image} alt="Lưu bút" loading="lazy" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    setShowDetails(false);
                                    setSelectedGuestBook(null);
                                }}
                                className="btn btn-primary"
                                aria-label="Đóng chi tiết"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add GuestBook Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Thêm lưu bút mới</h3>
                        <form onSubmit={handleAddGuestBook} className="guestbook-form">
                            <div className="form-group">
                                <label htmlFor="guest_name">Tên người gửi:</label>
                                <input
                                    type="text"
                                    id="guest_name"
                                    name="guest_name"
                                    value={formData.guest_name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">Nội dung:</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Hình ảnh (không bắt buộc):</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    capture="environment"
                                />
                                {previewImage && (
                                    <div className="image-preview">
                                        <img src={previewImage} alt="Xem trước" />
                                        <button 
                                            type="button" 
                                            className="remove-image" 
                                            onClick={removeImage}
                                            aria-label="Xóa hình ảnh"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="btn btn-outline"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Thêm lưu bút
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit GuestBook Modal */}
            {showEditModal && selectedGuestBook && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Sửa lưu bút</h3>
                        <form onSubmit={handleUpdateGuestBook} className="guestbook-form">
                            <div className="form-group">
                                <label htmlFor="edit_guest_name">Tên người gửi:</label>
                                <input
                                    type="text"
                                    id="edit_guest_name"
                                    name="guest_name"
                                    value={formData.guest_name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit_content">Nội dung:</label>
                                <textarea
                                    id="edit_content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit_image">Hình ảnh (không bắt buộc):</label>
                                <input
                                    type="file"
                                    id="edit_image"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    capture="environment"
                                />
                                {previewImage && (
                                    <div className="image-preview">
                                        <img src={previewImage} alt="Xem trước" />
                                        <button 
                                            type="button" 
                                            className="remove-image" 
                                            onClick={removeImage}
                                            aria-label="Xóa hình ảnh"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedGuestBook(null);
                                        resetForm();
                                    }}
                                    className="btn btn-outline"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}