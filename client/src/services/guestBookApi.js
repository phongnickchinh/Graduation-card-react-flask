import api from './apiClient';

const guestBookApi = {
  // Lấy tất cả lưu bút của người dùng đã đăng nhập
  getAllGuestBooks: () => {
    return api.get('/guestbook/');
  },

  // Lấy lưu bút theo ID
  getGuestBookById: (guestBookId) => {
    return api.get(`/guestbook/${guestBookId}`);
  },

  // Tạo lưu bút mới (khi đăng nhập)
  createGuestBook: (formData) => {
    return api.post('/guestbook/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Cập nhật lưu bút
  updateGuestBook: (formData) => {
    // formData phải có trường guest_book_id
    return api.put('/guestbook/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Xóa nhiều lưu bút
  deleteGuestBooks: (guestBookIds) => {
    return api.delete('/guestbook/', {
      data: { guest_book_ids: guestBookIds }
    });
  },

  // Lấy tất cả lưu bút theo username (khách side)
  getGuestBooksByUsernameGuestSide: (username) => {
    return api.get(`/guestbook/view/${username}`);
  },

  // Tạo lưu bút mới từ phía khách (không cần đăng nhập)
  createGuestBookAsGuest: (username, formData) => {
    return api.post(`/guestbook/add/${username}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

};

export default guestBookApi;