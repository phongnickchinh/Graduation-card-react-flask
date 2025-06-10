import { useEffect, useState } from 'react';
import AddGuestForm from '../../../components/AddGuestForm';
import EditGuestForm from '../../../components/EditGuestForm'; // Import the new component
import guestApi from '../../../services/guestApi';

export default function InviteManager() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [selectedGuestIds, setSelectedGuestIds] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Thêm khách mời
                </button>

                {selectedGuestIds.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Xóa đã chọn ({selectedGuestIds.length})
                    </button>
                )}
            </div>

            <h2 className="text-xl font-semibold mb-4">Danh sách khách mời</h2>

            {loading && <p>Đang tải...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && guests.length === 0 && <p>Chưa có khách mời nào.</p>}

            {!loading && guests.length > 0 && (
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-4 py-2 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedGuestIds.length === guests.length && guests.length > 0}
                                    onChange={handleSelectAll}
                                    className="mr-2"
                                />
                                #
                            </th>
                            <th className="border px-4 py-2 text-left">Tên thật</th>
                            <th className="border px-4 py-2 text-left">Nickname</th>
                            <th className="border px-4 py-2 text-left">Ngày tạo</th>
                            <th className="border px-4 py-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guests.map((guest, index) => (
                            <tr key={guest.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedGuestIds.includes(guest.id)}
                                        onChange={() => handleSelectGuest(guest.id)}
                                        className="mr-2"
                                    />
                                    {index + 1}
                                </td>
                                <td className="border px-4 py-2">{guest.realname}</td>
                                <td className="border px-4 py-2">{guest.nickname}</td>
                                <td className="border px-4 py-2">
                                    {new Date(guest.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleEditGuest(guest.id)}
                                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedGuestIds([guest.id]);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa {selectedGuestIds.length} khách mời đã chọn? 
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSelectedGuestIds([]);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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