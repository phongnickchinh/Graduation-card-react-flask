import { useEffect, useState } from 'react';
import guestBookApi from '../../services/guestBookApi';

export default function GuestBookPage() {
  const [guestBooks, setGuestBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuestBooks();
  }, []);

  const fetchGuestBooks = async () => {
    try {
      setLoading(true);
      const response = await guestBookApi.getAllGuestBooks();
      
      // Sắp xếp theo thời gian chỉnh sửa cuối cùng (updated_at hoặc created_at)
      const sortedGuestBooks = response.data.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA; // Mới nhất trước
      });

      setGuestBooks(sortedGuestBooks);
    } catch (err) {
      console.error('Error fetching guest books:', err);
      setError('Không thể tải danh sách lưu bút. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <h1>Sổ Lưu Bút</h1>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Sổ Lưu Bút</h1>
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={fetchGuestBooks}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sổ Lưu Bút</h1>
      <p>Tổng cộng: {guestBooks.length} lưu bút</p>
      
      {guestBooks.length === 0 ? (
        <div>
          <p>Chưa có lưu bút nào.</p>
        </div>
      ) : (
        <div>
          {guestBooks.map((guestBook) => (
            <div 
              key={guestBook.id} 
              style={{ 
                border: '1px solid #ccc', 
                margin: '20px 0', 
                padding: '15px',
                borderRadius: '8px'
              }}
            >
              {/* Header với thông tin người viết */}
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>
                  {guestBook.guest?.realname || 'Ẩn danh'}
                  {guestBook.guest?.nickname && (
                    <span style={{ fontWeight: 'normal', color: '#666' }}>
                      {' '}({guestBook.guest.nickname})
                    </span>
                  )}
                </h3>
                <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>
                  {formatDate(guestBook.updated_at || guestBook.created_at)}
                </p>
              </div>

              {/* Nội dung lưu bút */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                {/* Ảnh */}
                {guestBook.image_url && (
                  <div style={{ flexShrink: 0 }}>
                    <img 
                      src={guestBook.image_url} 
                      alt="Ảnh lưu bút"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9'
                      }}
                    />
                  </div>
                )}

                {/* Nội dung text */}
                <div style={{ flex: 1 }}>
                  {guestBook.content ? (
                    <div style={{ 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {guestBook.content}
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#999' }}>
                      Không có nội dung văn bản
                    </p>
                  )}
                </div>
              </div>

              {/* Footer với thông tin thêm nếu cần */}
              {guestBook.guest?.email && (
                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #eee',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Liên hệ: {guestBook.guest.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
