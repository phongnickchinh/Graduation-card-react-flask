import { useEffect, useState } from 'react';
import AddGuestForm from '../../../components/AddGuestForm';
import EditGuestForm from '../../../components/EditGuestForm'; // Import the new component
import { useAuth } from '../../../contexts/AuthContext';
import guestApi from '../../../services/guestApi';
import './ManageGuests.css';

export default function InviteManager() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [selectedGuestIds, setSelectedGuestIds] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await guestApi.getAllGuests();
                setGuests(res.data);
            } catch (err) {
                setError('Không thể tải danh sách khách mời.');
                console.error('Error fetching guests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuests();
    }, []);

    const handleEditGuest = async (guestId) => {
        try {
            const res = await guestApi.getGuestDetail(guestId);
            setSelectedGuest(res.data);
            setShowEditModal(true);
        } catch (err) {
            setError('Không thể tải thông tin khách mời.');
            console.error('Error fetching guest details:', err);
        }
    };

    const handleUpdateSuccess = (updatedGuest) => {
        setGuests(prev => prev.map(guest => 
            guest.id === updatedGuest.id ? updatedGuest : guest
        ));
        setShowEditModal(false);
        setSelectedGuest(null);
    };

    const handleSelectGuest = (guestId) => {
        setSelectedGuestIds(prev => {
            if (prev.includes(guestId)) {
                return prev.filter(id => id !== guestId);
            } else {
                return [...prev, guestId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedGuestIds.length === guests.length) {
            setSelectedGuestIds([]);
        } else {
            setSelectedGuestIds(guests.map(guest => guest.id));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedGuestIds.length === 0) {
            setError('Vui lòng chọn ít nhất một khách mời để xóa.');
            return;
        }
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await guestApi.deleteGuests(selectedGuestIds);
            setGuests(prev => prev.filter(guest => !selectedGuestIds.includes(guest.id)));
            setSelectedGuestIds([]);
            setShowDeleteConfirm(false);
            setError('');
        } catch (err) {
            setError('Không thể xóa khách mời.');
            console.error('Error deleting guests:', err);
        }
    };

    const handleExportGuests = () => {
        if (guests.length === 0) {
            setError('Không có khách mời nào để xuất.');
            return;
        }

        // Create CSV content
        const baseUrl = 'https://phamphong.id.vn/GraduationInvitation';
        
        // Extract username from user object (try different possible properties)
        const username = user?.username || user?.name || user?.user_name || '';
        
        if (!username) {
            setError('Không thể xuất danh sách. Không tìm thấy thông tin người dùng.');
            return;
        }
        
        const headers = ["Tên Thật", "Nickname", "Đường Dẫn Lời Mời"];
        const csvContent = [
            headers.join(','),
            ...guests.map(guest => {
                // Replace spaces with underscores in nickname for URL
                const urlSafeNickname = guest.nickname ? guest.nickname.replace(/\s+/g, '_') : '';
                const invitationUrl = `${baseUrl}/${username}/${urlSafeNickname}`;
                
                // Escape commas in CSV fields
                const escapedRealname = guest.realname ? `"${guest.realname.replace(/"/g, '""')}"` : '';
                const escapedNickname = guest.nickname ? `"${guest.nickname.replace(/"/g, '""')}"` : '';
                return `${escapedRealname},${escapedNickname},${invitationUrl}`;
            })
        ].join('\n');

        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `danh-sach-khach-moi-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="manage-guests-container">
            <div className="header-actions">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                >
                    + Thêm khách mời
                </button>

                <button 
                    onClick={handleExportGuests}
                    className="btn btn-secondary"
                >
                    Xuất danh sách
                </button>

                {selectedGuestIds.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="btn btn-danger"
                    >
                        Xóa đã chọn ({selectedGuestIds.length})
                    </button>
                )}
            </div>

            <h2 className="page-title">Danh sách khách mời</h2>

            {loading && <div className="loading-text">Đang tải...</div>}
            {error && <div className="error-text">{error}</div>}

            {!loading && guests.length === 0 && (
                <div className="empty-state">Chưa có khách mời nào.</div>
            )}

            {!loading && guests.length > 0 && (
                <table className="guests-table">
                    <thead className="table-header">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedGuestIds.length === guests.length && guests.length > 0}
                                    onChange={handleSelectAll}
                                    className="checkbox"
                                />
                                #
                            </th>
                            <th>Tên thật</th>
                            <th>Nickname</th>
                            {/* <th>Ngày tạo</th> */}
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guests.map((guest, index) => (
                            <tr key={guest.id} className="table-row">
                                <td className="table-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedGuestIds.includes(guest.id)}
                                        onChange={() => handleSelectGuest(guest.id)}
                                        className="checkbox"
                                    />
                                    {index + 1}
                                </td>
                                <td className="table-cell">{guest.realname}</td>
                                <td className="table-cell">{guest.nickname}</td>
                                {/* <td className="table-cell">
                                    {new Date(guest.created_at).toLocaleDateString('vi-VN')}
                                </td> */}
                                <td className="table-cell actions-cell">
                                    <button
                                        onClick={() => handleEditGuest(guest.id)}
                                        className="btn btn-secondary btn-small"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedGuestIds([guest.id]);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="btn btn-danger btn-small"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <AddGuestForm
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={(newGuest) => setGuests(prev => [...prev, newGuest])}
            />
            <EditGuestForm
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedGuest(null);
                }}
                guest={selectedGuest}
                onSuccess={handleUpdateSuccess}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Xác nhận xóa</h3>
                        <p className="modal-text">
                            Bạn có chắc chắn muốn xóa {selectedGuestIds.length} khách mời đã chọn? 
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSelectedGuestIds([]);
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
        </div>
    );
}