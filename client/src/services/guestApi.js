import api from './apiClient';

const guestApi = {
  getGuestByNickname: (nickname) => api.get(`/guest/${nickname}`),
  getAllGuests: () => {return api.get('/guest/');},

  addGuest: (formData) =>
  api.post('/guest/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  updateGuest: (formData) => {
    // Make sure the guestId is included in the formData
    console.log("Sending update request with data:", Object.fromEntries(formData));
    return api.put(`/guest/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getGuestDetail: (guestId) => {
    return api.get(`/guest/id/${guestId}`);
  },

  deleteGuests: (guestIds) => {
    return api.delete('/guest/', {
      data: { guest_ids: guestIds }
    });
  },
};

export default guestApi;
