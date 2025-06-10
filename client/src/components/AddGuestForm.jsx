import { useState } from 'react';
import guestApi from '../services/guestApi';

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
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.realname || !form.nickname || images.length === 0) {
      setError('Vui lòng nhập đầy đủ thông tin và ít nhất 1 ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('realname', form.realname);
    formData.append('nickname', form.nickname);
    images.forEach((img) => formData.append('images', img));

    setLoading(true);
    try {
      const res = await guestApi.addGuest(formData);
      onSuccess && onSuccess(res.data);
      setForm({ realname: '', nickname: '' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl font-semibold mb-4">Thêm khách mời mới</h3>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Tên thật *</label>
            <input
              type="text"
              name="realname"
              value={form.realname}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Nickname *</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Ảnh *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
            />
            <small className="text-gray-500">Có thể chọn nhiều ảnh.</small>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Đang thêm...' : 'Thêm khách mời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
