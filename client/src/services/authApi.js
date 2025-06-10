import api from './apiClient';

export async function loginApi(credentials) {
  const res = await api.post('/login', credentials);
  // res.data = { user: {...}, access_token, refresh_token }
  return res.data;
}

export async function logoutApi() {
  // Gửi logout, có thể k cần token vì token có thể hết hạn rồi
  try {
    await api.post('/logout');
  } catch (_) {}
}

export async function getProfileApi() {
  const res = await api.get('/user/');
  return res.data; // user info
}

export async function refreshTokenApi(refreshToken) {
  const res = await api.post('/refresh-token', { refresh_token: refreshToken });
  return res.data; // { access_token, refresh_token }
}
