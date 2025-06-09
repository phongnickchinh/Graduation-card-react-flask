import api from './apiClient';

const guestApi = {
  getGuestByNickname: (nickname) => api.get(`/guest/${nickname}`)
};

export default guestApi;
