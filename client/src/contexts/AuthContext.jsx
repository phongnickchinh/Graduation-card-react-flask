import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, logoutApi, getProfileApi, refreshTokenApi } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Sử dụng một hàm async bên trong useEffect
  const checkUserAuthentication = async () => {
    const accessToken = localStorage.getItem('access_token');
    console.log('Access Token:', accessToken);

    if (accessToken) {
      console.log('Checking user authentication...');
      try {
        const userInfo = await getProfileApi();
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to get user profile:', error);
        localStorage.removeItem('access_token');
        // localStorage.removeItem('refresh_token');
        setUser(null);
      } finally {
        // Luôn set loading thành false sau khi đã xử lý xong
        setLoading(false);
      }
    } else {
      // Nếu không có token, không cần loading nữa
      setLoading(false);
    }
  };

  checkUserAuthentication();
}, []);

  // Đăng nhập
  const login = async (credentials) => {
    const data = await loginApi(credentials);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  // Đăng xuất
  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // Tự động refresh token định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return;

      refreshTokenApi(refreshToken)
        .then((res) => {
          localStorage.setItem('access_token', res.access_token);
          // localStorage.setItem('refresh_token', res.refresh_token);
        })
        .catch(() => {
          logout();
        });
    }, 55 * 1000); // Gọi sau mỗi 55 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
